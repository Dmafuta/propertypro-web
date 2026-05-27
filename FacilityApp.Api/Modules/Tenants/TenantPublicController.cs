using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FacilityApp.Api.Modules.Tenants;

/// <summary>
/// Public tenant-resolution endpoints — no authentication required.
/// Used by the Next.js frontend to load branding and verify tenant slugs.
/// </summary>
[ApiController]
[Route("api/tenant")]
public class TenantPublicController(
    TenantContext tenantContext,
    TenantService tenantService) : ControllerBase
{
    /// <summary>
    /// Returns public info for the resolved tenant.
    /// Tenant is resolved from X-Tenant-Slug header or custom domain by TenantMiddleware.
    /// </summary>
    [HttpGet]
    public IActionResult GetCurrent()
    {
        if (!tenantContext.IsResolved)
            return NotFound(new { error = "Tenant not found" });

        return Ok(new
        {
            id             = tenantContext.TenantId,
            name           = tenantContext.Name,
            slug           = tenantContext.Slug,
            plan           = tenantContext.Plan.ToString(),
            logoUrl        = tenantContext.LogoUrl,
            primaryColour  = tenantContext.PrimaryColour,
            isCustomDomain = tenantContext.IsCustomDomain,
        });
    }

    /// <summary>
    /// Resolves a custom domain to its tenant slug.
    /// Used by the Next.js middleware to map custom domains at the edge.
    /// </summary>
    [HttpGet("resolve")]
    public async Task<IActionResult> ResolveByDomain([FromQuery] string domain)
    {
        if (string.IsNullOrWhiteSpace(domain))
            return BadRequest(new { error = "domain is required" });

        var resolved = await tenantService.ResolveByDomainAsync(domain.Trim().ToLower());
        if (resolved is null)
            return NotFound(new { error = "Tenant not found for this domain" });

        return Ok(new
        {
            id             = resolved.TenantId,
            name           = resolved.Name,
            slug           = resolved.Slug,
            plan           = resolved.Plan.ToString(),
            logoUrl        = resolved.LogoUrl,
            primaryColour  = resolved.PrimaryColour,
            isCustomDomain = true,
        });
    }
}
