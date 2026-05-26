namespace FacilityApp.Api.Data.Models;

public enum TenantPlan { Starter = 0, Professional = 1 }

public class Tenant
{
    public Guid       Id            { get; set; }
    public string     Name          { get; set; } = "";
    public string     Slug          { get; set; } = "";
    public bool       IsActive      { get; set; } = true;
    public bool       IsSystem      { get; set; }
    public TenantPlan Plan          { get; set; } = TenantPlan.Starter;
    public string?    CustomDomain  { get; set; }
    public string?    ContactEmail  { get; set; }
    public string?    ContactPhone  { get; set; }
    public string?    Address       { get; set; }
    public string?    Website       { get; set; }
    public string?    LogoUrl       { get; set; }
    public string?    PrimaryColour { get; set; }
    public DateTime   CreatedAt     { get; set; } = DateTime.UtcNow;
}
