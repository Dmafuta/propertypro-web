using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Units;

[ApiController]
[Route("api/units")]
[Authorize]
public class UnitsController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var units = await ctx.Units
            .OrderBy(u => u.Block).ThenBy(u => u.Floor).ThenBy(u => u.Number)
            .Select(u => new
            {
                u.Id, u.Number, u.Floor, u.Block, u.Description, u.IsOccupied, u.CreatedAt,
                Owner = ctx.UserUnits
                    .Where(uu => uu.UnitId == u.Id && uu.LinkType == UnitLinkType.Owner)
                    .Select(uu => new { uu.User!.Id, uu.User.FullName, uu.User.Email }).FirstOrDefault(),
                Occupant = ctx.UserUnits
                    .Where(uu => uu.UnitId == u.Id && uu.LinkType == UnitLinkType.Occupant)
                    .Select(uu => new { uu.User!.Id, uu.User.FullName, uu.User.Email }).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(units);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var unit = await ctx.Units.FirstOrDefaultAsync(u => u.Id == id);
        if (unit is null) return NotFound();

        var links = await ctx.UserUnits.Include(uu => uu.User).Where(uu => uu.UnitId == id).ToListAsync();
        return Ok(new
        {
            unit.Id, unit.Number, unit.Floor, unit.Block, unit.Description, unit.IsOccupied,
            Owner    = links.Where(l => l.LinkType == UnitLinkType.Owner)
                           .Select(l => new { l.User!.Id, l.User.FullName, l.User.Email }).FirstOrDefault(),
            Occupant = links.Where(l => l.LinkType == UnitLinkType.Occupant)
                           .Select(l => new { l.User!.Id, l.User.FullName, l.User.Email }).FirstOrDefault(),
        });
    }

    [HttpPost]
    [Authorize(Policy = "CanManageUnits")]
    public async Task<IActionResult> Create([FromBody] UnitBodyRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var unit = new Unit { TenantId = tenant.TenantId, Number = req.Number, Floor = req.Floor, Block = req.Block, Description = req.Description };
        ctx.Units.Add(unit);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = unit.Id }, new { unit.Id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "CanManageUnits")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UnitBodyRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var unit = await ctx.Units.FindAsync(id);
        if (unit is null) return NotFound();

        unit.Number = req.Number; unit.Floor = req.Floor; unit.Block = req.Block; unit.Description = req.Description;
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "CanManageUnits")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var unit = await ctx.Units.FindAsync(id);
        if (unit is null) return NotFound();

        ctx.Units.Remove(unit);
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/assign-owner")]
    [Authorize(Policy = "CanManageUnits")]
    public async Task<IActionResult> AssignOwner(Guid id, [FromBody] AssignUserRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var unit = await ctx.Units.FindAsync(id);
        if (unit is null) return NotFound();

        var existing = await ctx.UserUnits.Where(uu => uu.UnitId == id && uu.LinkType == UnitLinkType.Owner).ToListAsync();
        ctx.UserUnits.RemoveRange(existing);

        if (req.UserId is not null)
            ctx.UserUnits.Add(new UserUnit { TenantId = tenant.TenantId, UserId = req.UserId, UnitId = id, LinkType = UnitLinkType.Owner });

        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/assign-occupant")]
    [Authorize(Policy = "CanManageUnits")]
    public async Task<IActionResult> AssignOccupant(Guid id, [FromBody] AssignUserRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var unit = await ctx.Units.FindAsync(id);
        if (unit is null) return NotFound();

        var existing = await ctx.UserUnits.Where(uu => uu.UnitId == id && uu.LinkType == UnitLinkType.Occupant).ToListAsync();
        foreach (var link in existing)
        {
            var oldUser = await userManager.FindByIdAsync(link.UserId);
            if (oldUser is not null) await userManager.RemoveFromRoleAsync(oldUser, "Occupant");
        }
        ctx.UserUnits.RemoveRange(existing);
        unit.IsOccupied = false;

        if (req.UserId is not null)
        {
            ctx.UserUnits.Add(new UserUnit { TenantId = tenant.TenantId, UserId = req.UserId, UnitId = id, LinkType = UnitLinkType.Occupant });
            unit.IsOccupied = true;
            var newUser = await userManager.FindByIdAsync(req.UserId);
            if (newUser is not null) await userManager.AddToRoleAsync(newUser, "Occupant");
        }

        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
