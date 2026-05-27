using System.Text;
using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Middleware;
using FacilityApp.Api.Modules.Auth;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// ── Connection string ──────────────────────────────────────────────────────────
var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection not configured");

// ── NpgsqlDataSource (singleton — used by TenantService and CORS) ─────────────
var npgsqlDataSource = NpgsqlDataSource.Create(connStr);
builder.Services.AddSingleton(npgsqlDataSource);

// ── EF Core ────────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connStr));
builder.Services.AddDbContextFactory<AppDbContext>(
    o => o.UseNpgsql(connStr), ServiceLifetime.Scoped);

// ── Identity ───────────────────────────────────────────────────────────────────
builder.Services.AddIdentityCore<ApplicationUser>(o =>
{
    o.Password.RequiredLength         = 8;
    o.Password.RequireNonAlphanumeric = false;
    o.User.RequireUniqueEmail         = true;
})
.AddRoles<IdentityRole>()
.AddSignInManager()
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ── JWT ────────────────────────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? Environment.GetEnvironmentVariable("Jwt__Secret")
    ?? throw new InvalidOperationException("Jwt:Secret not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"]  ?? "FacilityApp",
            ValidAudience            = builder.Configuration["Jwt:Audience"] ?? "FacilityApp",
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew                = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CanManageUsers",    p => p.RequireRole("Admin"))
    .AddPolicy("CanManageUnits",    p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("CanViewReports",    p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("CanManageVisitors", p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("CanCheckInVisitors",p => p.RequireRole("Admin", "Manager", "Security"))
    .AddPolicy("CanPreRegisterVisits", p => p.RequireRole("Admin", "Manager", "Receptionist", "Occupant"))
    .AddPolicy("CanLogIncidents",   p => p.RequireRole("Admin", "Manager", "Receptionist", "Security"))
    .AddPolicy("CanManageIncidents",p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("CanAccessParking",  p => p.RequireRole("Admin", "Manager", "Security"))
    .AddPolicy("CanManageParking",  p => p.RequireRole("Admin", "Manager"));

// ── CORS ───────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(o => o.AddPolicy("FrontendPolicy", policy =>
{
    policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
}));

// ── App services ───────────────────────────────────────────────────────────────
builder.Services.AddScoped<TenantContext>();
builder.Services.AddScoped<TenantService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<OtpService>();
builder.Services.AddHttpClient<ISmsService, AfricasTalkingService>();

// ── Minimal API JSON options (case-insensitive for dev endpoints) ──────────────
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNameCaseInsensitive = true;
    o.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// ── Controllers + OpenAPI ──────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ── Health check ───────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddCheck("postgres", () =>
    {
        try
        {
            using var conn = npgsqlDataSource.OpenConnection();
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy(ex.Message);
        }
    });

// ──────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Migrate + seed roles ───────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db          = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var roleMgr     = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    await db.Database.MigrateAsync();

    string[] roles = ["SuperAdmin", "Admin", "Manager", "Receptionist", "Security", "Occupant"];
    foreach (var role in roles)
        if (!await roleMgr.RoleExistsAsync(role))
            await roleMgr.CreateAsync(new IdentityRole(role));
}

// ── Middleware pipeline ────────────────────────────────────────────────────────
app.UseMiddleware<ErrorHandlingMiddleware>();   // must be first

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseForwardedHeaders();
app.UseCors("FrontendPolicy");

// Tenant middleware runs before auth so TenantContext is populated for query filters
app.UseRouting();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// ── Dev seed endpoints ─────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapGet("/dev/seed-superadmin", async (
        UserManager<ApplicationUser> userMgr,
        AppDbContext db) =>
    {
        const string email    = "superadmin@facilityapp.io";
        const string password = "SuperAdmin1!";

        // Ensure platform tenant exists
        var platform = await db.Tenants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Slug == "platform");

        if (platform is null)
        {
            platform = new FacilityApp.Api.Data.Models.Tenant
            {
                Id       = Guid.NewGuid(),
                Name     = "Platform",
                Slug     = "platform",
                IsActive = true,
                IsSystem = true,
                Plan     = FacilityApp.Api.Data.Models.TenantPlan.Professional,
            };
            db.Tenants.Add(platform);
            await db.SaveChangesAsync();
        }

        if (await userMgr.FindByEmailAsync(email) is null)
        {
            var user = new ApplicationUser
            {
                UserName  = email,
                Email     = email,
                FullName  = "Super Admin",
                TenantId  = platform.Id,
                UserType  = FacilityApp.Api.Data.Models.UserType.Staff,
                EmailConfirmed = true,
            };
            await userMgr.CreateAsync(user, password);
            await userMgr.AddToRoleAsync(user, "SuperAdmin");
        }

        return Results.Ok(new { email, password });
    });

    // Direct login bypassing 2FA — dev/testing only
    app.MapPost("/dev/login", async (
        HttpContext httpCtx,
        UserManager<ApplicationUser> userMgr,
        SignInManager<ApplicationUser> signMgr,
        TokenService tokenSvc,
        AppDbContext db) =>
    {
        using var doc  = await System.Text.Json.JsonDocument.ParseAsync(httpCtx.Request.Body);
        var email    = doc.RootElement.GetProperty("email").GetString() ?? "";
        var password = doc.RootElement.GetProperty("password").GetString() ?? "";

        var user = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Results.Unauthorized();

        var result = await signMgr.CheckPasswordSignInAsync(user, password, false);
        if (!result.Succeeded) return Results.Unauthorized();

        var roles  = await userMgr.GetRolesAsync(user);
        var access = tokenSvc.GenerateAccessToken(user, roles, user.TenantId);
        var refresh= await tokenSvc.CreateRefreshTokenAsync(user.Id);

        var tenant = await db.Tenants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == user.TenantId);

        // Use anonymous object so minimal API serializes camelCase (matching frontend expectations)
        return Results.Ok(new
        {
            accessToken  = access,
            refreshToken = refresh,
            user = new
            {
                id            = user.Id,
                email         = user.Email ?? "",
                fullName      = user.FullName,
                userType      = user.UserType.ToString(),
                roles         = (IList<string>)roles,
                tenantId      = user.TenantId.ToString(),
                tenantName    = tenant?.Name ?? "",
                tenantSlug    = tenant?.Slug ?? "",
                primaryColour = tenant?.PrimaryColour,
                logoUrl       = tenant?.LogoUrl,
            },
        });
    });

    // Returns (or resets) the active OTP for a user — dev/testing only
    app.MapGet("/dev/get-otp", async (
        string email, string purpose,
        UserManager<ApplicationUser> userMgr,
        AppDbContext db) =>
    {
        var user = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Results.NotFound(new { error = $"User '{email}' not found" });

        // Invalidate existing codes
        await db.OtpCodes
            .Where(o => o.UserId == user.Id && o.Purpose == purpose && !o.IsUsed)
            .ExecuteUpdateAsync(s => s.SetProperty(o => o.IsUsed, true));

        // Create a new code with known value "123456"
        const string plainCode = "123456";
        var hash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(plainCode)));
        db.OtpCodes.Add(new FacilityApp.Api.Data.Models.OtpCode
        {
            UserId    = user.Id,
            CodeHash  = hash,
            Purpose   = purpose,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
        });
        await db.SaveChangesAsync();

        return Results.Ok(new { email, purpose, code = plainCode, expiresInMinutes = 10 });
    });

    // Sets and verifies a phone number for any user — bypasses SMS for dev/testing
    app.MapGet("/dev/verify-phone", async (
        string email, string phone,
        UserManager<ApplicationUser> userMgr) =>
    {
        var user = await userMgr.FindByEmailAsync(email);
        if (user is null) return Results.NotFound(new { error = $"User '{email}' not found" });
        user.PhoneNumber = phone;
        user.PhoneNumberConfirmed = true;
        await userMgr.UpdateAsync(user);
        return Results.Ok(new { email, phone, phoneNumberConfirmed = true });
    });

    app.MapGet("/dev/seed-admin", async (
        string tenantSlug, string email, string password,
        UserManager<ApplicationUser> userMgr,
        AppDbContext db) =>
    {
        var tenant = await db.Tenants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Slug == tenantSlug);

        if (tenant is null)
        {
            tenant = new FacilityApp.Api.Data.Models.Tenant
            {
                Id       = Guid.NewGuid(),
                Name     = tenantSlug,
                Slug     = tenantSlug,
                IsActive = true,
                Plan     = FacilityApp.Api.Data.Models.TenantPlan.Starter,
            };
            db.Tenants.Add(tenant);
            await db.SaveChangesAsync();
        }

        if (await userMgr.FindByEmailAsync(email) is null)
        {
            var user = new ApplicationUser
            {
                UserName  = email,
                Email     = email,
                FullName  = "Admin",
                TenantId  = tenant.Id,
                UserType  = FacilityApp.Api.Data.Models.UserType.Staff,
                EmailConfirmed = true,
            };
            await userMgr.CreateAsync(user, password);
            await userMgr.AddToRoleAsync(user, "Admin");
        }

        return Results.Ok(new { tenantSlug, email });
    });
}

app.Run();
