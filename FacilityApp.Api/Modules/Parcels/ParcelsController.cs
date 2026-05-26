using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Parcels;

[ApiController]
[Route("api/parcels")]
[Authorize]
public class ParcelsController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? status, [FromQuery] Guid? unitId)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var isStaff = User.IsInRole("Admin") || User.IsInRole("Manager") || User.IsInRole("Receptionist") || User.IsInRole("Security");
        var q = ctx.Parcels.Include(p => p.Unit).Include(p => p.LoggedBy).AsQueryable();

        if (!isStaff)
        {
            var userId  = userManager.GetUserId(User);
            var unitIds = await ctx.UserUnits.Where(uu => uu.UserId == userId).Select(uu => uu.UnitId).ToListAsync();
            q = q.Where(p => unitIds.Contains(p.UnitId));
        }

        if (unitId.HasValue) q = q.Where(p => p.UnitId == unitId);
        if (Enum.TryParse<ParcelStatus>(status, ignoreCase: true, out var ps)) q = q.Where(p => p.Status == ps);

        var items = await q.OrderByDescending(p => p.CreatedAt).Select(p => Map(p)).ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Receptionist,Security")]
    public async Task<IActionResult> Receive([FromBody] ReceiveParcelRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        if (!await ctx.Units.AnyAsync(u => u.Id == req.UnitId))
            return BadRequest(new { error = "Unit not found" });

        var parcel = new Parcel
        {
            TenantId = tenant.TenantId, UnitId = req.UnitId, RecipientName = req.RecipientName,
            Courier = req.Courier, Description = req.Description, TrackingNumber = req.TrackingNumber,
            LoggedById = userManager.GetUserId(User)!,
        };
        ctx.Parcels.Add(parcel);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(List), new { }, new { parcel.Id });
    }

    [HttpPost("{id:guid}/collect")]
    [Authorize(Roles = "Admin,Manager,Receptionist,Security")]
    public async Task<IActionResult> Collect(Guid id, [FromBody] CollectParcelRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var p = await ctx.Parcels.FindAsync(id);
        if (p is null) return NotFound();
        if (p.Status != ParcelStatus.Pending) return Conflict(new { error = "Parcel is not pending" });

        p.Status = ParcelStatus.Collected; p.CollectedBy = req.CollectedBy; p.CollectedAt = DateTime.UtcNow;
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/return")]
    [Authorize(Roles = "Admin,Manager,Receptionist,Security")]
    public async Task<IActionResult> Return(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var p = await ctx.Parcels.FindAsync(id);
        if (p is null) return NotFound();
        if (p.Status != ParcelStatus.Pending) return Conflict(new { error = "Parcel is not pending" });

        p.Status = ParcelStatus.Returned; p.ReturnedAt = DateTime.UtcNow;
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    private static object Map(Parcel p) => new
    {
        p.Id, p.RecipientName, p.Courier, p.Description, p.TrackingNumber,
        p.Status, p.CollectedBy, p.CollectedAt, p.ReturnedAt, p.CreatedAt,
        UnitNumber = p.Unit?.Number, UnitId = p.UnitId,
        LoggedBy   = p.LoggedBy is null ? null : new { p.LoggedBy.Id, p.LoggedBy.FullName },
    };
}
