namespace FacilityApp.Api.Data.Models;

public class Announcement
{
    public Guid     Id        { get; set; }
    public Guid     TenantId  { get; set; }
    public string   Title     { get; set; } = "";
    public string   Body      { get; set; } = "";
    public string?  Category  { get; set; }
    public bool     IsActive  { get; set; } = true;
    public DateTime? ExpiresAt{ get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
