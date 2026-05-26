using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FacilityApp.Api.Modules.Auth;

public class TokenService(IConfiguration config, IDbContextFactory<AppDbContext> factory)
{
    private readonly string _secret        = config["Jwt:Secret"]             ?? throw new InvalidOperationException("Jwt:Secret not configured");
    private readonly string _issuer        = config["Jwt:Issuer"]             ?? "FacilityApp";
    private readonly string _audience      = config["Jwt:Audience"]           ?? "FacilityApp";
    private readonly int    _accessMinutes = int.Parse(config["Jwt:AccessTokenMinutes"] ?? "60");
    private readonly int    _refreshDays   = int.Parse(config["Jwt:RefreshTokenDays"]   ?? "30");

    public string GenerateAccessToken(ApplicationUser user, IList<string> roles, Guid tenantId)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,   user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
            new("name",     user.FullName),
            new("tenantId", tenantId.ToString()),
            new("userType", user.UserType.ToString()),
        };
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(_accessMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<string> CreateRefreshTokenAsync(string userId)
    {
        var raw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        await using var ctx = await factory.CreateDbContextAsync();

        await ctx.RefreshTokens
            .Where(t => t.UserId == userId && !t.IsRevoked)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.IsRevoked, true));

        ctx.RefreshTokens.Add(new RefreshToken
        {
            UserId    = userId,
            Token     = raw,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshDays),
        });
        await ctx.SaveChangesAsync();
        return raw;
    }

    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string raw)
    {
        await using var ctx = await factory.CreateDbContextAsync();
        return await ctx.RefreshTokens
            .Include(t => t.User)
            .IgnoreQueryFilters()
            .Where(t => t.Token == raw && !t.IsRevoked && t.ExpiresAt > DateTime.UtcNow)
            .FirstOrDefaultAsync();
    }

    public async Task RevokeRefreshTokenAsync(string raw)
    {
        await using var ctx = await factory.CreateDbContextAsync();
        await ctx.RefreshTokens
            .IgnoreQueryFilters()
            .Where(t => t.Token == raw)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.IsRevoked, true));
    }

    public async Task RevokeAllRefreshTokensAsync(string userId)
    {
        await using var ctx = await factory.CreateDbContextAsync();
        await ctx.RefreshTokens
            .IgnoreQueryFilters()
            .Where(t => t.UserId == userId && !t.IsRevoked)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.IsRevoked, true));
    }

    public TokenValidationParameters GetValidationParameters() => new()
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = _issuer,
        ValidAudience            = _audience,
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret)),
        ClockSkew                = TimeSpan.Zero,
    };
}
