namespace FacilityApp.Api.Data.Models;

public enum UnitLinkType { Owner = 0, Occupant = 1 }

public class UserUnit
{
    public Guid         Id          { get; set; }
    public Guid         TenantId    { get; set; }
    public string       UserId      { get; set; } = "";
    public Guid         UnitId      { get; set; }
    public UnitLinkType LinkType    { get; set; }
    public DateTime     CreatedAt   { get; set; } = DateTime.UtcNow;

    public ApplicationUser? User { get; set; }
    public Unit?            Unit { get; set; }
}
