namespace FacilityApp.Api.Data.Models;

public class Unit
{
    public Guid    Id         { get; set; }
    public Guid    TenantId   { get; set; }
    public string  Number     { get; set; } = "";
    public string? Floor      { get; set; }
    public string? Block      { get; set; }
    public string? Description{ get; set; }
    public bool    IsOccupied { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
