namespace FacilityApp.Api.Data.Models;

public enum UnitRequestStatus { Pending = 0, Approved = 1, Rejected = 2 }

public class UnitRequest
{
    public Guid              Id            { get; set; }
    public Guid              TenantId      { get; set; }
    public string            ResidentId    { get; set; } = "";
    public Guid              UnitId        { get; set; }
    public UnitRequestStatus Status        { get; set; } = UnitRequestStatus.Pending;
    public string?           Note          { get; set; }
    public string?           ReviewNote    { get; set; }
    public string?           ReviewedById  { get; set; }
    public DateTime          RequestedAt   { get; set; } = DateTime.UtcNow;
    public DateTime?         ReviewedAt    { get; set; }

    public ApplicationUser? Resident   { get; set; }
    public Unit?            Unit       { get; set; }
    public ApplicationUser? ReviewedBy { get; set; }
}
