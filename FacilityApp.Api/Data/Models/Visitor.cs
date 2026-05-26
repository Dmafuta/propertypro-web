namespace FacilityApp.Api.Data.Models;

public class Visitor
{
    public Guid    Id        { get; set; }
    public Guid    TenantId  { get; set; }
    public string  FullName  { get; set; } = "";
    public string  Email     { get; set; } = "";
    public string  Phone     { get; set; } = "";
    public string? Company   { get; set; }
    public string? PhotoUrl  { get; set; }
    public DateTime CreatedAt{ get; set; } = DateTime.UtcNow;
}
