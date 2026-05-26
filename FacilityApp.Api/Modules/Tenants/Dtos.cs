using FacilityApp.Api.Data.Models;

namespace FacilityApp.Api.Modules.Tenants;

public record CreateTenantRequest(string Name, string Slug, string? ContactEmail = null);
public record UpdatePlanRequest(TenantPlan Plan);
public record UpdateTenantRequest(
    string  Name,
    string? ContactEmail  = null,
    string? ContactPhone  = null,
    string? Address       = null,
    string? Website       = null,
    string? PrimaryColour = null,
    string? LogoUrl       = null,
    string? CustomDomain  = null);
