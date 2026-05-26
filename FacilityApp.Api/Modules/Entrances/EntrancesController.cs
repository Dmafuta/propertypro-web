using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Entrances;

[ApiController]
[Route("api/entrances")]
[Authorize]
public class EntrancesController(IDbContextFactory<AppDbContext> factory, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var items = await ctx.Entrances
            .OrderBy(e => e.Name)
            .Select(e => new { e.Id, e.Name, e.Location, e.IsActive, e.CreatedAt })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] EntranceRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var entrance = new Entrance { TenantId = tenant.TenantId, Name = req.Name, Location = req.Location };
        ctx.Entrances.Add(entrance);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(List), new { }, new { entrance.Id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] EntranceRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var e = await ctx.Entrances.FindAsync(id);
        if (e is null) return NotFound();

        e.Name     = req.Name;
        e.Location = req.Location;
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var e = await ctx.Entrances.FindAsync(id);
        if (e is null) return NotFound();

        e.IsActive = !e.IsActive;
        await ctx.SaveChangesAsync();
        return Ok(new { e.IsActive });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var e = await ctx.Entrances.FindAsync(id);
        if (e is null) return NotFound();

        ctx.Entrances.Remove(e);
        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
