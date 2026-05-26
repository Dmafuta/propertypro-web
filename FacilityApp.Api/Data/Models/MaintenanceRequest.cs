namespace FacilityApp.Api.Data.Models;

public enum MaintenanceCategory { Plumbing, Electrical, HVAC, Structural, Appliance, Pest, Cleaning, Other }
public enum MaintenancePriority { Low, Medium, High, Urgent }
public enum MaintenanceStatus  { Open, InProgress, Resolved, Closed }

public class MaintenanceRequest
{
    public Guid                 Id           { get; set; }
    public Guid                 TenantId     { get; set; }
    public string               ResidentId   { get; set; } = "";
    public Guid?                UnitId       { get; set; }
    public string               Title        { get; set; } = "";
    public string               Description  { get; set; } = "";
    public MaintenanceCategory  Category     { get; set; }
    public MaintenancePriority  Priority     { get; set; }
    public MaintenanceStatus    Status       { get; set; } = MaintenanceStatus.Open;
    public string?              StaffNote    { get; set; }
    public string?              AssignedToId { get; set; }
    public DateTime             CreatedAt    { get; set; } = DateTime.UtcNow;
    public DateTime             UpdatedAt    { get; set; } = DateTime.UtcNow;
    public DateTime?            ResolvedAt   { get; set; }

    public ApplicationUser? Resident   { get; set; }
    public ApplicationUser? AssignedTo { get; set; }
    public Unit?            Unit       { get; set; }
}
