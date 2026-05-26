using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Tenants;

[ApiController]
[Route("api/tenants")]
[Authorize(Roles = "SuperAdmin")]
public class TenantsController(IDbContextFactory<AppDbContext> factory) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        await using var ctx = await factory.CreateDbContextAsync();

        var tenants = await ctx.Tenants.IgnoreQueryFilters()
            .Where(t => !t.IsSystem).OrderBy(t => t.Name)
            .Select(t => new
            {
                t.Id, t.Name, t.Slug, t.IsActive, t.Plan, t.CustomDomain,
                t.ContactEmail, t.ContactPhone, t.Address, t.Website, t.PrimaryColour, t.LogoUrl, t.CreatedAt,
            })
            .ToListAsync();

        return Ok(tenants);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        await using var ctx = await factory.CreateDbContextAsync();
        var t = await ctx.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
        if (t is null) return NotFound();

        return Ok(new
        {
            t.Id, t.Name, t.Slug, t.IsActive, t.Plan, t.CustomDomain,
            t.ContactEmail, t.ContactPhone, t.Address, t.Website, t.PrimaryColour, t.LogoUrl, t.CreatedAt,
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTenantRequest req)
    {
        await using var ctx = await factory.CreateDbContextAsync();

        if (await ctx.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Slug == req.Slug))
            return Conflict(new { error = "Slug already in use" });

        var tenant = new Tenant { Name = req.Name, Slug = req.Slug.ToLower(), ContactEmail = req.ContactEmail, Plan = TenantPlan.Starter };
        ctx.Tenants.Add(tenant);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = tenant.Id }, new { tenant.Id, tenant.Slug });
    }

    [HttpPatch("{id:guid}/plan")]
    public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] UpdatePlanRequest req)
    {
        await using var ctx = await factory.CreateDbContextAsync();
        var t = await ctx.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return NotFound();

        t.Plan = req.Plan;
        await ctx.SaveChangesAsync();
        return Ok(new { t.Plan });
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        await using var ctx = await factory.CreateDbContextAsync();
        var t = await ctx.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return NotFound();

        t.IsActive = !t.IsActive;
        await ctx.SaveChangesAsync();
        return Ok(new { t.IsActive });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTenantRequest req)
    {
        await using var ctx = await factory.CreateDbContextAsync();
        var t = await ctx.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return NotFound();

        t.Name = req.Name; t.ContactEmail = req.ContactEmail; t.ContactPhone = req.ContactPhone;
        t.Address = req.Address; t.Website = req.Website; t.PrimaryColour = req.PrimaryColour; t.LogoUrl = req.LogoUrl;

        if (req.CustomDomain is not null)
        {
            if (t.Plan < TenantPlan.Professional) return BadRequest(new { error = "Custom domain requires Professional plan" });
            t.CustomDomain = req.CustomDomain;
        }

        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
