using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Parking;

[ApiController]
[Route("api/parking")]
[Authorize]
public class ParkingController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("vehicles")]
    public async Task<IActionResult> ListVehicles([FromQuery] string? ownerId)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var isStaff = User.IsInRole("Admin") || User.IsInRole("Manager") || User.IsInRole("Security");
        var userId  = userManager.GetUserId(User);
        var q       = ctx.Vehicles.Include(v => v.Owner).Include(v => v.Tag).AsQueryable();

        if (!isStaff)      q = q.Where(v => v.OwnerId == userId);
        else if (ownerId is not null) q = q.Where(v => v.OwnerId == ownerId);

        var items = await q.OrderByDescending(v => v.CreatedAt)
            .Select(v => new
            {
                v.Id, v.Make, v.Model, v.Plate, v.Colour, v.Type, v.CreatedAt,
                Owner = new { v.Owner!.Id, v.Owner.FullName, v.Owner.Email },
                Tag   = v.Tag == null ? null : new { v.Tag.Id, v.Tag.TagNumber, v.Tag.Status, v.Tag.IssuedAt, v.Tag.ExpiresAt },
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("vehicles")]
    public async Task<IActionResult> RegisterVehicle([FromBody] RegisterVehicleRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var isStaff = User.IsInRole("Admin") || User.IsInRole("Manager") || User.IsInRole("Security");
        if (req.OwnerId is not null && !isStaff) return Forbid();

        var vehicle = new Vehicle
        {
            TenantId = tenant.TenantId, OwnerId = req.OwnerId ?? userManager.GetUserId(User)!,
            Make = req.Make, Model = req.Model, Plate = req.Plate.ToUpper(), Colour = req.Colour, Type = req.Type,
        };
        ctx.Vehicles.Add(vehicle);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(ListVehicles), new { }, new { vehicle.Id });
    }

    [HttpDelete("vehicles/{id:guid}")]
    public async Task<IActionResult> DeleteVehicle(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var v = await ctx.Vehicles.FindAsync(id);
        if (v is null) return NotFound();

        var userId  = userManager.GetUserId(User);
        var isStaff = User.IsInRole("Admin") || User.IsInRole("Manager");
        if (!isStaff && v.OwnerId != userId) return Forbid();

        ctx.Vehicles.Remove(v);
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("vehicles/{vehicleId:guid}/tags")]
    [Authorize(Policy = "CanManageParking")]
    public async Task<IActionResult> IssueTag(Guid vehicleId, [FromBody] IssueTagRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        if (!await ctx.Vehicles.AnyAsync(v => v.Id == vehicleId)) return NotFound();

        var existing = await ctx.VehicleTags.FirstOrDefaultAsync(t => t.VehicleId == vehicleId);
        if (existing is not null) ctx.VehicleTags.Remove(existing);

        var tag = new VehicleTag
        {
            TenantId = tenant.TenantId, VehicleId = vehicleId, TagNumber = req.TagNumber,
            IssuedById = userManager.GetUserId(User)!, ExpiresAt = req.ExpiresAt,
        };
        ctx.VehicleTags.Add(tag);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(ListVehicles), new { }, new { tag.Id, tag.TagNumber });
    }

    [HttpPatch("tags/{id:guid}/status")]
    [Authorize(Policy = "CanManageParking")]
    public async Task<IActionResult> UpdateTagStatus(Guid id, [FromBody] UpdateTagStatusRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var tag = await ctx.VehicleTags.FindAsync(id);
        if (tag is null) return NotFound();

        tag.Status = req.Status;
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("records")]
    [Authorize(Policy = "CanAccessParking")]
    public async Task<IActionResult> ListRecords(
        [FromQuery] bool?     active,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int       page     = 1,
        [FromQuery] int       pageSize = 50)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var q = ctx.ParkingRecords.AsQueryable();
        if (active == true)  q = q.Where(r => r.ExitedAt == null);
        if (active == false) q = q.Where(r => r.ExitedAt != null);
        if (from.HasValue)   q = q.Where(r => r.EnteredAt >= from);
        if (to.HasValue)     q = q.Where(r => r.EnteredAt <= to);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(r => r.EnteredAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(r => new { r.Id, r.TagNumber, r.Plate, r.RecordType, r.EnteredAt, r.ExitedAt, r.Notes })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpPost("records/entry")]
    [Authorize(Policy = "CanAccessParking")]
    public async Task<IActionResult> LogEntry([FromBody] LogEntryRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var recordType = ParkingRecordType.Unknown;
        if (req.TagNumber is not null)
        {
            var tag = await ctx.VehicleTags.FirstOrDefaultAsync(t => t.TagNumber == req.TagNumber);
            if (tag is not null && tag.Status == TagStatus.Active) recordType = ParkingRecordType.Resident;
        }

        var record = new ParkingRecord
        {
            TenantId   = tenant.TenantId, TagNumber = req.TagNumber, Plate = req.Plate.ToUpper(),
            RecordType = req.RecordType ?? recordType, LoggedById = userManager.GetUserId(User), Notes = req.Notes,
        };
        ctx.ParkingRecords.Add(record);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(ListRecords), new { }, new { record.Id });
    }

    [HttpPost("records/{id:guid}/exit")]
    [Authorize(Policy = "CanAccessParking")]
    public async Task<IActionResult> LogExit(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var r = await ctx.ParkingRecords.FindAsync(id);
        if (r is null) return NotFound();
        if (r.ExitedAt.HasValue) return Conflict(new { error = "Exit already recorded" });

        r.ExitedAt = DateTime.UtcNow;
        await ctx.SaveChangesAsync();
        return Ok(new { r.ExitedAt });
    }
}
