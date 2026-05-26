using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Incidents;

[ApiController]
[Route("api/incidents")]
[Authorize]
public class IncidentsController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "CanLogIncidents")]
    public async Task<IActionResult> List([FromQuery] string? status)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var q = ctx.IncidentReports.Include(i => i.ReportedBy).AsQueryable();
        if (Enum.TryParse<IncidentStatus>(status, ignoreCase: true, out var ps)) q = q.Where(i => i.Status == ps);

        var items = await q.OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id, i.Title, i.Description, i.Location, i.Parties, i.Category,
                i.Severity, i.Status, i.Resolution, i.CreatedAt, i.ResolvedAt,
                ReportedBy = i.ReportedBy == null ? null : new { i.ReportedBy.Id, i.ReportedBy.FullName },
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "CanLogIncidents")]
    public async Task<IActionResult> Get(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var i = await ctx.IncidentReports.Include(x => x.ReportedBy).FirstOrDefaultAsync(x => x.Id == id);
        if (i is null) return NotFound();

        return Ok(new
        {
            i.Id, i.Title, i.Description, i.Location, i.Parties, i.Category,
            i.Severity, i.Status, i.Resolution, i.CreatedAt, i.ResolvedAt,
            ReportedBy = i.ReportedBy == null ? null : new { i.ReportedBy.Id, i.ReportedBy.FullName },
        });
    }

    [HttpPost]
    [Authorize(Policy = "CanLogIncidents")]
    public async Task<IActionResult> Create([FromBody] CreateIncidentRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var incident = new IncidentReport
        {
            TenantId = tenant.TenantId, ReportedById = userManager.GetUserId(User)!,
            Title = req.Title, Description = req.Description, Location = req.Location,
            Parties = req.Parties, Category = req.Category, Severity = req.Severity,
        };
        ctx.IncidentReports.Add(incident);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = incident.Id }, new { incident.Id });
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "CanManageIncidents")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateIncidentStatusRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var i = await ctx.IncidentReports.FindAsync(id);
        if (i is null) return NotFound();

        i.Status     = req.Status;
        i.Resolution = req.Resolution ?? i.Resolution;
        if (req.Status is IncidentStatus.Resolved or IncidentStatus.Closed) i.ResolvedAt = DateTime.UtcNow;

        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
