namespace FacilityApp.Api.Data.Models;

public class Entrance
{
    public Guid    Id        { get; set; }
    public Guid    TenantId  { get; set; }
    public string  Name      { get; set; } = "";
    public string? Location  { get; set; }
    public bool    IsActive  { get; set; } = true;
    public DateTime CreatedAt{ get; set; } = DateTime.UtcNow;
}
