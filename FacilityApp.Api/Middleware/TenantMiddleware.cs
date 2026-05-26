using FacilityApp.Api.Services;

namespace FacilityApp.Api.Middleware;

public class TenantMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, TenantService tenantService, TenantContext tenantContext)
    {
        // 1. Try custom domain first
        var host = context.Request.Host.Host;
        var resolved = await tenantService.ResolveByDomainAsync(host);

        // 2. Fall back to slug in route  /api/{slug}/...  or  /api/{slug}  header
        if (resolved is null)
        {
            var slug = context.Request.RouteValues["tenantSlug"]?.ToString()
                    ?? context.Request.Headers["X-Tenant-Slug"].FirstOrDefault();

            if (!string.IsNullOrEmpty(slug))
                resolved = await tenantService.ResolveBySlugAsync(slug);
        }

        if (resolved is not null)
        {
            tenantContext.TenantId       = resolved.TenantId;
            tenantContext.Slug           = resolved.Slug;
            tenantContext.Name           = resolved.Name;
            tenantContext.Plan           = resolved.Plan;
            tenantContext.PrimaryColour  = resolved.PrimaryColour;
            tenantContext.LogoUrl        = resolved.LogoUrl;
            tenantContext.IsResolved     = true;
            tenantContext.IsCustomDomain = resolved.IsCustomDomain;
        }

        await next(context);
    }
}
