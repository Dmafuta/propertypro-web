using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Units;

[ApiController]
[Route("api/unit-requests")]
[Authorize]
public class UnitRequestsController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var userId  = userManager.GetUserId(User);
        var isStaff = User.IsInRole("Admin") || User.IsInRole("Manager");

        var q = ctx.UnitRequests.Include(r => r.Resident).Include(r => r.Unit).Include(r => r.ReviewedBy).AsQueryable();
        if (!isStaff) q = q.Where(r => r.ResidentId == userId);

        var items = await q.OrderByDescending(r => r.RequestedAt)
            .Select(r => new
            {
                r.Id, r.Status, r.Note, r.ReviewNote, r.RequestedAt, r.ReviewedAt,
                Unit       = r.Unit == null ? null : new { r.Unit.Id, r.Unit.Number, r.Unit.Block, r.Unit.Floor },
                Resident   = r.Resident == null ? null : new { r.Resident.Id, r.Resident.FullName, r.Resident.Email },
                ReviewedBy = r.ReviewedBy == null ? null : new { r.ReviewedBy.Id, r.ReviewedBy.FullName },
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitUnitRequestDto req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var userId = userManager.GetUserId(User)!;
        var hasPending = await ctx.UnitRequests.AnyAsync(r => r.ResidentId == userId && r.Status == UnitRequestStatus.Pending);
        if (hasPending) return Conflict(new { error = "You already have a pending unit request" });

        var unit = await ctx.Units.FindAsync(req.UnitId);
        if (unit is null) return BadRequest(new { error = "Unit not found" });

        var request = new Data.Models.UnitRequest { TenantId = tenant.TenantId, ResidentId = userId, UnitId = req.UnitId, Note = req.Note };
        ctx.UnitRequests.Add(request);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(List), new { }, new { request.Id });
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = "CanManageUnits")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ReviewUnitRequestDto req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var r = await ctx.UnitRequests.Include(x => x.Resident).FirstOrDefaultAsync(x => x.Id == id);
        if (r is null) return NotFound();
        if (r.Status != UnitRequestStatus.Pending) return Conflict(new { error = "Request is not pending" });

        r.Status = UnitRequestStatus.Approved;
        r.ReviewNote = req.ReviewNote;
        r.ReviewedById = userManager.GetUserId(User);
        r.ReviewedAt = DateTime.UtcNow;

        var existingOccupant = await ctx.UserUnits.Where(uu => uu.UnitId == r.UnitId && uu.LinkType == UnitLinkType.Occupant).ToListAsync();
        foreach (var link in existingOccupant)
        {
            var oldUser = await userManager.FindByIdAsync(link.UserId);
            if (oldUser is not null) await userManager.RemoveFromRoleAsync(oldUser, "Occupant");
        }
        ctx.UserUnits.RemoveRange(existingOccupant);
        ctx.UserUnits.Add(new UserUnit { TenantId = tenant.TenantId, UserId = r.ResidentId, UnitId = r.UnitId, LinkType = UnitLinkType.Occupant });

        var unit = await ctx.Units.FindAsync(r.UnitId);
        if (unit is not null) unit.IsOccupied = true;
        if (r.Resident is not null) await userManager.AddToRoleAsync(r.Resident, "Occupant");

        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = "CanManageUnits")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] ReviewUnitRequestDto req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var r = await ctx.UnitRequests.FindAsync(id);
        if (r is null) return NotFound();
        if (r.Status != UnitRequestStatus.Pending) return Conflict(new { error = "Request is not pending" });

        r.Status = UnitRequestStatus.Rejected;
        r.ReviewNote = req.ReviewNote;
        r.ReviewedById = userManager.GetUserId(User);
        r.ReviewedAt = DateTime.UtcNow;

        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
