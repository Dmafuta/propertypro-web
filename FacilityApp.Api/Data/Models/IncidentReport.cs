namespace FacilityApp.Api.Data.Models;

public enum IncidentSeverity { Low, Medium, High, Critical }
public enum IncidentStatus   { Open, UnderReview, Resolved, Closed }

public class IncidentReport
{
    public Guid             Id           { get; set; }
    public Guid             TenantId     { get; set; }
    public string           ReportedById { get; set; } = "";
    public string           Title        { get; set; } = "";
    public string           Description  { get; set; } = "";
    public string?          Location     { get; set; }
    public string?          Parties      { get; set; }
    public string?          Category     { get; set; }
    public IncidentSeverity Severity     { get; set; }
    public IncidentStatus   Status       { get; set; } = IncidentStatus.Open;
    public string?          Resolution   { get; set; }
    public DateTime         CreatedAt    { get; set; } = DateTime.UtcNow;
    public DateTime?        ResolvedAt   { get; set; }

    public ApplicationUser? ReportedBy { get; set; }
}
