using FacilityApp.Api.Data;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.AuditLog;

[ApiController]
[Route("api/audit-log")]
[Authorize(Roles = "Admin")]
public class AuditLogController(IDbContextFactory<AppDbContext> factory, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] int     page     = 1,
        [FromQuery] int     pageSize = 50,
        [FromQuery] string? userId   = null,
        [FromQuery] string? action   = null)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var q = ctx.AuditLogs.AsQueryable();
        if (userId is not null) q = q.Where(a => a.UserId == userId);
        if (action  is not null) q = q.Where(a => a.Action.Contains(action));

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(a => new { a.Id, a.UserId, a.Action, a.EntityType, a.EntityId, a.Details, a.IpAddress, a.CreatedAt })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }
}
