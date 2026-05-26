using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Maintenance;

[ApiController]
[Route("api/maintenance")]
[Authorize]
public class MaintenanceController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? status)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var userId  = userManager.GetUserId(User);
        var isStaff = User.IsInRole("Admin") || User.IsInRole("Manager") || User.IsInRole("Receptionist") || User.IsInRole("Security");

        var q = ctx.MaintenanceRequests.Include(m => m.Resident).Include(m => m.AssignedTo).Include(m => m.Unit).AsQueryable();
        if (!isStaff) q = q.Where(m => m.ResidentId == userId);
        if (Enum.TryParse<MaintenanceStatus>(status, ignoreCase: true, out var ps)) q = q.Where(m => m.Status == ps);

        var items = await q.OrderByDescending(m => m.CreatedAt).Select(m => Map(m)).ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var m = await ctx.MaintenanceRequests.Include(m => m.Resident).Include(m => m.AssignedTo).Include(m => m.Unit)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (m is null) return NotFound();

        var userId  = userManager.GetUserId(User);
        var isStaff = User.IsInRole("Admin") || User.IsInRole("Manager") || User.IsInRole("Receptionist") || User.IsInRole("Security");
        if (!isStaff && m.ResidentId != userId) return Forbid();

        return Ok(Map(m));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMaintenanceRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var request = new Data.Models.MaintenanceRequest
        {
            TenantId    = tenant.TenantId,
            ResidentId  = userManager.GetUserId(User)!,
            UnitId      = req.UnitId,
            Title       = req.Title,
            Description = req.Description,
            Category    = req.Category,
            Priority    = req.Priority,
        };
        ctx.MaintenanceRequests.Add(request);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = request.Id }, new { request.Id });
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Manager,Receptionist,Security")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateMaintenanceStatusRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var m = await ctx.MaintenanceRequests.FindAsync(id);
        if (m is null) return NotFound();

        m.Status       = req.Status;
        m.StaffNote    = req.StaffNote    ?? m.StaffNote;
        m.AssignedToId = req.AssignedToId ?? m.AssignedToId;
        m.UpdatedAt    = DateTime.UtcNow;
        if (req.Status == MaintenanceStatus.Resolved) m.ResolvedAt = DateTime.UtcNow;

        await ctx.SaveChangesAsync();
        return NoContent();
    }

    private static object Map(Data.Models.MaintenanceRequest m) => new
    {
        m.Id, m.Title, m.Description, m.Category, m.Priority, m.Status,
        m.StaffNote, m.CreatedAt, m.UpdatedAt, m.ResolvedAt,
        UnitNumber = m.Unit?.Number,
        Resident   = m.Resident   is null ? null : new { m.Resident.Id,   m.Resident.FullName,   m.Resident.Email },
        AssignedTo = m.AssignedTo is null ? null : new { m.AssignedTo.Id, m.AssignedTo.FullName },
    };
}
