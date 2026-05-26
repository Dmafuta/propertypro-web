using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FacilityApp.Api.Modules.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    TokenService tokenService,
    TenantContext tenantContext) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (!tenantContext.IsResolved)
            return BadRequest(new { error = "Tenant not found" });

        var user = await userManager.FindByEmailAsync(req.Email);
        if (user is null || user.TenantId != tenantContext.TenantId)
            return Unauthorized(new { error = "Invalid credentials" });

        var result = await signInManager.CheckPasswordSignInAsync(user, req.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
                return Unauthorized(new { error = "Account locked. Try again later." });
            return Unauthorized(new { error = "Invalid credentials" });
        }

        if (req.StaffOnly && (user.UserType == UserType.HomeOwner || user.UserType == UserType.Resident))
            return Forbid();

        var roles        = await userManager.GetRolesAsync(user);
        var accessToken  = tokenService.GenerateAccessToken(user, roles, tenantContext.TenantId);
        var refreshToken = await tokenService.CreateRefreshTokenAsync(user.Id);

        return Ok(new TokenResponse(accessToken, refreshToken, UserDto.From(user, roles, tenantContext)));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
    {
        var existing = await tokenService.ValidateRefreshTokenAsync(req.RefreshToken);
        if (existing?.User is null)
            return Unauthorized(new { error = "Invalid or expired refresh token" });

        var user  = existing.User;
        var roles = await userManager.GetRolesAsync(user);

        var newAccess  = tokenService.GenerateAccessToken(user, roles, user.TenantId);
        var newRefresh = await tokenService.CreateRefreshTokenAsync(user.Id);

        return Ok(new TokenResponse(newAccess, newRefresh, UserDto.From(user, roles, tenantContext)));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest req)
    {
        await tokenService.RevokeRefreshTokenAsync(req.RefreshToken);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = userManager.GetUserId(User);
        if (userId is null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var roles = await userManager.GetRolesAsync(user);
        return Ok(UserDto.From(user, roles, tenantContext));
    }

    // ── POST /api/auth/register ────────────────────────────────────────────────
    // Resident self-registration. Always creates a HomeOwner with no role until
    // admin assigns a unit (which grants Occupant role).
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (!tenantContext.IsResolved)
            return BadRequest(new { error = "Tenant not found" });

        var user = new ApplicationUser
        {
            UserName       = req.Email,
            Email          = req.Email,
            FullName       = req.FullName,
            PhoneNumber    = req.Phone,
            TenantId       = tenantContext.TenantId,
            UserType       = Data.Models.UserType.HomeOwner,
            EmailConfirmed = true,   // simplified — wire email verification when SMTP is configured
        };

        var result = await userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        var roles       = await userManager.GetRolesAsync(user);
        var accessToken = tokenService.GenerateAccessToken(user, roles, tenantContext.TenantId);
        var refresh     = await tokenService.CreateRefreshTokenAsync(user.Id);

        return CreatedAtAction(nameof(Me), null,
            new TokenResponse(accessToken, refresh, UserDto.From(user, roles, tenantContext)));
    }

    // ── POST /api/auth/forgot-password ────────────────────────────────────────
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        if (!tenantContext.IsResolved)
            return BadRequest(new { error = "Tenant not found" });

        var user = await userManager.FindByEmailAsync(req.Email);

        // Always return 200 to avoid user enumeration
        if (user is null || user.TenantId != tenantContext.TenantId)
            return Ok(new { message = "If that email exists, a reset link has been sent." });

        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        // TODO: send email with token when SMTP is configured.
        // In development, return the token directly so the frontend can test the flow.
        var isDev = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
        if (isDev)
            return Ok(new { message = "Reset token generated (dev only).", token });

        return Ok(new { message = "If that email exists, a reset link has been sent." });
    }

    // ── POST /api/auth/reset-password ─────────────────────────────────────────
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        if (!tenantContext.IsResolved)
            return BadRequest(new { error = "Tenant not found" });

        var user = await userManager.FindByEmailAsync(req.Email);
        if (user is null || user.TenantId != tenantContext.TenantId)
            return BadRequest(new { error = "Invalid request" });

        var result = await userManager.ResetPasswordAsync(user, req.Token, req.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        // Revoke all existing refresh tokens on password reset
        await tokenService.RevokeAllRefreshTokensAsync(user.Id);

        return Ok(new { message = "Password reset successfully." });
    }
}
