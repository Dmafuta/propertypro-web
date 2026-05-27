using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;

namespace FacilityApp.Api.Modules.Auth;

public record LoginRequest(string Email, string Password, bool StaffOnly = false);
public record RefreshRequest(string RefreshToken);
public record TokenResponse(string AccessToken, string RefreshToken, UserDto User);

public record RegisterRequest(
    string   FullName,
    string   Email,
    string   Password,
    string?  Phone    = null);

public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);

// ── 2FA ───────────────────────────────────────────────────────────────────────
public record VerifyTwoFactorRequest(string TempToken, string Code);
public record SendTwoFactorRequest(string TempToken);
public record SendPhoneVerificationRequest(string PhoneNumber);
public record VerifyPhoneRequest(string PhoneNumber, string Code);
public record ToggleTwoFactorRequest(bool Enable);

public record UserDto(
    string   Id,
    string   Email,
    string   FullName,
    string   UserType,
    string[] Roles,
    string   TenantId,
    string   TenantName,
    string   TenantSlug,
    string?  PrimaryColour,
    string?  LogoUrl)
{
    public static UserDto From(ApplicationUser user, IList<string> roles, TenantContext ctx) => new(
        Id:            user.Id,
        Email:         user.Email ?? "",
        FullName:      user.FullName,
        UserType:      user.UserType.ToString(),
        Roles:         [.. roles],
        TenantId:      user.TenantId.ToString(),
        TenantName:    ctx.Name,
        TenantSlug:    ctx.Slug,
        PrimaryColour: ctx.PrimaryColour,
        LogoUrl:       ctx.LogoUrl);
}
