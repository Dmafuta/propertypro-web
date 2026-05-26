using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Visitors;

[ApiController]
[Route("api/visitors")]
[Authorize]
public class VisitorsController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? tab, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var now   = DateTime.UtcNow;
        var today = now.Date;

        var q = ctx.Visits.Include(v => v.Visitor).Include(v => v.Host).AsQueryable();
        q = tab switch
        {
            "today"    => q.Where(v => v.ScheduledAt >= today && v.ScheduledAt < today.AddDays(1)),
            "upcoming" => q.Where(v => v.ScheduledAt > now && v.Status == VisitStatus.Scheduled),
            "active"   => q.Where(v => v.Status == VisitStatus.Active),
            "history"  => q.Where(v => v.Status == VisitStatus.Completed || v.Status == VisitStatus.NoShow),
            _          => q,
        };

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(v => v.ScheduledAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(v => Map(v))
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var visit = await ctx.Visits.Include(v => v.Visitor).Include(v => v.Host)
            .FirstOrDefaultAsync(v => v.Id == id);
        return visit is null ? NotFound() : Ok(Map(visit));
    }

    [HttpPost]
    [Authorize(Policy = "CanPreRegisterVisits")]
    public async Task<IActionResult> Create([FromBody] CreateVisitRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var visitor = await ctx.Visitors.FirstOrDefaultAsync(v => v.Email == req.VisitorEmail);
        if (visitor is null)
        {
            visitor = new Visitor
            {
                TenantId = tenant.TenantId,
                FullName = req.VisitorName,
                Email    = req.VisitorEmail,
                Phone    = req.VisitorPhone ?? "",
                Company  = req.VisitorCompany,
            };
            ctx.Visitors.Add(visitor);
        }

        var visit = new Visit
        {
            TenantId    = tenant.TenantId,
            VisitorId   = visitor.Id,
            HostId      = req.HostId ?? userManager.GetUserId(User),
            Purpose     = req.Purpose,
            Notes       = req.Notes,
            ScheduledAt = req.ScheduledAt,
        };
        ctx.Visits.Add(visit);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = visit.Id }, new { visit.Id });
    }

    [HttpPost("{id:guid}/checkin")]
    [Authorize(Policy = "CanCheckInVisitors")]
    public async Task<IActionResult> CheckIn(Guid id, [FromBody] CheckInRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var visit = await ctx.Visits.FindAsync(id);
        if (visit is null) return NotFound();
        if (visit.Status == VisitStatus.Active)
            return Conflict(new { error = "Already checked in" });
        if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled or VisitStatus.NoShow)
            return Conflict(new { error = "Visit cannot be checked in" });

        visit.Status          = VisitStatus.Active;
        visit.CheckedInAt     = DateTime.UtcNow;
        visit.EntryEntranceId = req.EntranceId;
        await ctx.SaveChangesAsync();
        return Ok(new { visit.Id, visit.Status, visit.CheckedInAt });
    }

    [HttpPost("{id:guid}/checkout")]
    [Authorize(Policy = "CanCheckInVisitors")]
    public async Task<IActionResult> CheckOut(Guid id, [FromBody] CheckOutRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var visit = await ctx.Visits.FindAsync(id);
        if (visit is null) return NotFound();
        if (visit.Status != VisitStatus.Active)
            return Conflict(new { error = "Visit is not active" });

        visit.Status         = VisitStatus.Completed;
        visit.CheckedOutAt   = DateTime.UtcNow;
        visit.ExitEntranceId = req.EntranceId;
        await ctx.SaveChangesAsync();
        return Ok(new { visit.Id, visit.Status, visit.CheckedOutAt });
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Policy = "CanManageVisitors")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var visit = await ctx.Visits.FindAsync(id);
        if (visit is null) return NotFound();
        if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled)
            return Conflict(new { error = "Visit already finalised" });

        visit.Status = VisitStatus.Cancelled;
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/noshow")]
    [Authorize(Policy = "CanManageVisitors")]
    public async Task<IActionResult> NoShow(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var visit = await ctx.Visits.FindAsync(id);
        if (visit is null) return NotFound();
        if (visit.Status != VisitStatus.Scheduled)
            return Conflict(new { error = "Only scheduled visits can be marked no-show" });

        visit.Status = VisitStatus.NoShow;
        await ctx.SaveChangesAsync();
        return NoContent();
    }

    private static object Map(Visit v) => new
    {
        v.Id, v.Purpose, v.Notes, v.Status, v.ScheduledAt,
        v.CheckedInAt, v.CheckedOutAt, v.EntryEntranceId, v.ExitEntranceId, v.CreatedAt,
        Visitor = v.Visitor is null ? null : new { v.Visitor.Id, v.Visitor.FullName, v.Visitor.Email, v.Visitor.Phone, v.Visitor.Company, v.Visitor.PhotoUrl },
        Host    = v.Host    is null ? null : new { v.Host.Id, v.Host.FullName, v.Host.Email },
    };
}
