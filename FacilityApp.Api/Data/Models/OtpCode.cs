namespace FacilityApp.Api.Data.Models;

public class OtpCode
{
    public Guid     Id        { get; set; }
    public string   UserId    { get; set; } = "";
    public string   CodeHash  { get; set; } = "";
    public string   Purpose   { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public bool     IsUsed    { get; set; }
    public int      Attempts  { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation optional to avoid EF query filter warnings (OtpCode is not tenant-scoped)
    public ApplicationUser? User { get; set; }

}

public static class OtpPurpose
{
    public const string Login       = "login";
    public const string PhoneVerify = "phone-verify";
}
