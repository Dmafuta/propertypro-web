namespace FacilityApp.Api.Data.Models;

public enum VisitStatus { Scheduled = 0, Active = 1, Completed = 2, Cancelled = 3, NoShow = 4 }

public class Visit
{
    public Guid        Id               { get; set; }
    public Guid        TenantId         { get; set; }
    public Guid        VisitorId        { get; set; }
    public string?     HostId           { get; set; }
    public string      Purpose          { get; set; } = "";
    public string?     Notes            { get; set; }
    public VisitStatus Status           { get; set; } = VisitStatus.Scheduled;
    public DateTime    ScheduledAt      { get; set; }
    public DateTime?   CheckedInAt      { get; set; }
    public DateTime?   CheckedOutAt     { get; set; }
    public Guid?       EntryEntranceId  { get; set; }
    public Guid?       ExitEntranceId   { get; set; }
    public DateTime    CreatedAt        { get; set; } = DateTime.UtcNow;

    public Visitor?         Visitor  { get; set; }
    public ApplicationUser? Host     { get; set; }
}
