namespace FacilityApp.Api.Data.Models;

public class RefreshToken
{
    public Guid     Id         { get; set; }
    public string   UserId     { get; set; } = "";
    public string   Token      { get; set; } = "";
    public DateTime ExpiresAt  { get; set; }
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
    public bool     IsRevoked  { get; set; }

    public ApplicationUser? User { get; set; }
}
