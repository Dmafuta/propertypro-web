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
    OtpService otpService,
    TenantContext tenantContext) : ControllerBase
{
    // ── POST /api/auth/login ───────────────────────────────────────────────────
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

        bool isStaff          = user.UserType == UserType.Staff;
        bool requiresTwoFactor = isStaff || user.TwoFactorEnabled;

        if (requiresTwoFactor)
        {
            if (!user.PhoneNumberConfirmed || string.IsNullOrEmpty(user.PhoneNumber))
            {
                if (isStaff)
                    return Unauthorized(new { error = "Your account requires a verified phone number for two-factor authentication. Please contact your administrator." });

                // Resident enabled 2FA but phone no longer verified — disable silently and proceed
                user.TwoFactorEnabled = false;
                await userManager.UpdateAsync(user);
            }
            else
            {
                var sent = await otpService.SendOtpAsync(user.Id, user.PhoneNumber, OtpPurpose.Login);
                if (!sent)
                    return StatusCode(503, new { error = "Failed to send verification code. Please try again." });

                var tempToken = tokenService.GenerateTempToken(user.Id);
                return Ok(new
                {
                    requiresTwoFactor = true,
                    tempToken,
                    maskedPhone = MaskPhone(user.PhoneNumber),
                });
            }
        }

        var roles       = await userManager.GetRolesAsync(user);
        var accessToken = tokenService.GenerateAccessToken(user, roles, tenantContext.TenantId);
        var refresh     = await tokenService.CreateRefreshTokenAsync(user.Id);

        return Ok(new TokenResponse(accessToken, refresh, UserDto.From(user, roles, tenantContext)));
    }

    // ── POST /api/auth/send-2fa ────────────────────────────────────────────────
    [HttpPost("send-2fa")]
    public async Task<IActionResult> SendTwoFactor([FromBody] SendTwoFactorRequest req)
    {
        var userId = tokenService.ValidateTempToken(req.TempToken);
        if (userId is null)
            return Unauthorized(new { error = "Invalid or expired session. Please log in again." });

        var user = await userManager.FindByIdAsync(userId);
        if (user is null || string.IsNullOrEmpty(user.PhoneNumber) || !user.PhoneNumberConfirmed)
            return BadRequest(new { error = "Phone number not available." });

        if (await otpService.HasRecentOtpAsync(userId, OtpPurpose.Login))
            return BadRequest(new { error = "A code was recently sent. Please wait 30 seconds before requesting another." });

        var sent = await otpService.SendOtpAsync(userId, user.PhoneNumber, OtpPurpose.Login);
        if (!sent)
            return StatusCode(503, new { error = "Failed to send code. Please try again." });

        return Ok(new { message = "Code sent.", maskedPhone = MaskPhone(user.PhoneNumber) });
    }

    // ── POST /api/auth/verify-2fa ──────────────────────────────────────────────
    [HttpPost("verify-2fa")]
    public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorRequest req)
    {
        var userId = tokenService.ValidateTempToken(req.TempToken);
        if (userId is null)
            return Unauthorized(new { error = "Invalid or expired session. Please log in again." });

        var valid = await otpService.VerifyOtpAsync(userId, req.Code, OtpPurpose.Login);
        if (!valid)
            return Unauthorized(new { error = "Invalid or expired code." });

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var roles       = await userManager.GetRolesAsync(user);
        var accessToken = tokenService.GenerateAccessToken(user, roles, user.TenantId);
        var refresh     = await tokenService.CreateRefreshTokenAsync(user.Id);

        return Ok(new TokenResponse(accessToken, refresh, UserDto.From(user, roles, tenantContext)));
    }

    // ── POST /api/auth/send-phone-verification ────────────────────────────────
    [HttpPost("send-phone-verification")]
    [Authorize]
    public async Task<IActionResult> SendPhoneVerification([FromBody] SendPhoneVerificationRequest req)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null) return Unauthorized();

        var normalized = NormalizePhone(req.PhoneNumber);
        if (normalized is null)
            return BadRequest(new { error = "Invalid phone number. Use E.164 format, e.g. +254712345678" });

        if (await otpService.HasRecentOtpAsync(userId, OtpPurpose.PhoneVerify))
            return BadRequest(new { error = "A code was recently sent. Please wait 30 seconds." });

        bool sent;
        try
        {
            sent = await otpService.SendOtpAsync(userId, normalized, OtpPurpose.PhoneVerify);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"[{ex.GetType().Name}] {ex.Message}" });
        }

        if (!sent)
            return StatusCode(503, new { error = "Failed to send code. Please try again." });

        return Ok(new { message = "Verification code sent.", maskedPhone = MaskPhone(normalized) });
    }

    // ── POST /api/auth/verify-phone ───────────────────────────────────────────
    [HttpPost("verify-phone")]
    [Authorize]
    public async Task<IActionResult> VerifyPhone([FromBody] VerifyPhoneRequest req)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null) return Unauthorized();

        var normalized = NormalizePhone(req.PhoneNumber);
        if (normalized is null)
            return BadRequest(new { error = "Invalid phone number." });

        var valid = await otpService.VerifyOtpAsync(userId, req.Code, OtpPurpose.PhoneVerify);
        if (!valid)
            return Unauthorized(new { error = "Invalid or expired code." });

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        user.PhoneNumber          = normalized;
        user.PhoneNumberConfirmed = true;
        await userManager.UpdateAsync(user);

        return Ok(new { message = "Phone number verified successfully." });
    }

    // ── PUT /api/auth/toggle-2fa ──────────────────────────────────────────────
    [HttpPut("toggle-2fa")]
    [Authorize]
    public async Task<IActionResult> ToggleTwoFactor([FromBody] ToggleTwoFactorRequest req)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        if (user.UserType == UserType.Staff)
            return BadRequest(new { error = "Two-factor authentication is mandatory for staff accounts and cannot be disabled." });

        if (req.Enable && (!user.PhoneNumberConfirmed || string.IsNullOrEmpty(user.PhoneNumber)))
            return BadRequest(new { error = "Please verify your phone number before enabling two-factor authentication." });

        user.TwoFactorEnabled = req.Enable;
        await userManager.UpdateAsync(user);

        return Ok(new
        {
            twoFactorEnabled = user.TwoFactorEnabled,
            message = req.Enable ? "Two-factor authentication enabled." : "Two-factor authentication disabled.",
        });
    }

    // ── POST /api/auth/refresh ────────────────────────────────────────────────
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

    // ── POST /api/auth/logout ─────────────────────────────────────────────────
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest req)
    {
        await tokenService.RevokeRefreshTokenAsync(req.RefreshToken);
        return NoContent();
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────
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

    // ── GET /api/auth/me/phone ────────────────────────────────────────────────
    [HttpGet("me/phone")]
    [Authorize]
    public async Task<IActionResult> GetMyPhone()
    {
        var userId = userManager.GetUserId(User);
        if (userId is null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        return Ok(new
        {
            phoneNumber           = user.PhoneNumber,
            phoneNumberConfirmed  = user.PhoneNumberConfirmed,
            twoFactorEnabled      = user.TwoFactorEnabled,
        });
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────
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
            EmailConfirmed = true,
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
        if (user is null || user.TenantId != tenantContext.TenantId)
            return Ok(new { message = "If that email exists, a reset link has been sent." });

        var token = await userManager.GeneratePasswordResetTokenAsync(user);

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

        await tokenService.RevokeAllRefreshTokensAsync(user.Id);
        return Ok(new { message = "Password reset successfully." });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static string MaskPhone(string phone)
    {
        if (phone.Length <= 4) return "****";
        var suffix = phone[^2..];
        var prefix = phone.Length > 4 ? phone[..3] : phone[..2];
        var masked = new string('*', phone.Length - prefix.Length - suffix.Length);
        return $"{prefix}{masked}{suffix}";
    }

    private static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return null;
        phone = phone.Trim();
        if (!phone.StartsWith('+')) return null;
        var digits = phone[1..];
        if (digits.Length < 7 || digits.Length > 15 || !digits.All(char.IsDigit)) return null;
        return phone;
    }
}
