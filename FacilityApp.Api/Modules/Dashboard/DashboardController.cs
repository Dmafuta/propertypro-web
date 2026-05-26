using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Dashboard;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(IDbContextFactory<AppDbContext> factory, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var today    = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var stats = new
        {
            TotalUnits          = await ctx.Units.CountAsync(),
            OccupiedUnits       = await ctx.Units.CountAsync(u => u.IsOccupied),
            TodayVisits         = await ctx.Visits.CountAsync(v => v.ScheduledAt >= today && v.ScheduledAt < tomorrow),
            ActiveVisits        = await ctx.Visits.CountAsync(v => v.Status == VisitStatus.Active),
            OpenMaintenance     = await ctx.MaintenanceRequests.CountAsync(m => m.Status == MaintenanceStatus.Open || m.Status == MaintenanceStatus.InProgress),
            PendingParcels      = await ctx.Parcels.CountAsync(p => p.Status == ParcelStatus.Pending),
            OpenIncidents       = await ctx.IncidentReports.CountAsync(i => i.Status == IncidentStatus.Open || i.Status == IncidentStatus.UnderReview),
            PendingUnitRequests = await ctx.UnitRequests.CountAsync(r => r.Status == UnitRequestStatus.Pending),
            ActiveVehicles      = await ctx.ParkingRecords.CountAsync(p => p.ExitedAt == null),
            UpcomingVisits      = await ctx.Visits
                .Where(v => v.ScheduledAt >= DateTime.UtcNow && v.Status == VisitStatus.Scheduled)
                .OrderBy(v => v.ScheduledAt)
                .Take(5)
                .Select(v => new
                {
                    v.Id, v.Purpose, v.ScheduledAt,
                    VisitorName = v.Visitor!.FullName,
                    HostName    = v.Host != null ? v.Host.FullName : null,
                })
                .ToListAsync(),
        };

        return Ok(stats);
    }
}
