using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Announcements;

[ApiController]
[Route("api/announcements")]
[Authorize]
public class AnnouncementsController(IDbContextFactory<AppDbContext> factory, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] bool? active)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var q = ctx.Announcements.AsQueryable();
        if (active == true) q = q.Where(a => a.IsActive && (a.ExpiresAt == null || a.ExpiresAt > DateTime.UtcNow));

        var items = await q.OrderByDescending(a => a.CreatedAt)
            .Select(a => new { a.Id, a.Title, a.Body, a.Category, a.IsActive, a.ExpiresAt, a.CreatedAt })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create([FromBody] AnnouncementRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var a = new Announcement { TenantId = tenant.TenantId, Title = req.Title, Body = req.Body, Category = req.Category, ExpiresAt = req.ExpiresAt };
        ctx.Announcements.Add(a);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(List), new { }, new { a.Id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AnnouncementRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var a = await ctx.Announcements.FindAsync(id);
        if (a is null) return NotFound();

        a.Title = req.Title; a.Body = req.Body; a.Category = req.Category; a.ExpiresAt = req.ExpiresAt;
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var a = await ctx.Announcements.FindAsync(id);
        if (a is null) return NotFound();

        a.IsActive = !a.IsActive;
        await ctx.SaveChangesAsync();
        return Ok(new { a.IsActive });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var a = await ctx.Announcements.FindAsync(id);
        if (a is null) return NotFound();

        ctx.Announcements.Remove(a);
        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
