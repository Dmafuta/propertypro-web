using FacilityApp.Api.Data.Models;

namespace FacilityApp.Api.Services;

public class TenantContext
{
    public Guid        TenantId       { get; set; }
    public string      Slug           { get; set; } = "";
    public string      Name           { get; set; } = "";
    public bool        IsResolved     { get; set; }
    public bool        IsCustomDomain { get; set; }
    public TenantPlan  Plan           { get; set; } = TenantPlan.Starter;
    public string?     PrimaryColour  { get; set; }
    public string?     LogoUrl        { get; set; }
}
