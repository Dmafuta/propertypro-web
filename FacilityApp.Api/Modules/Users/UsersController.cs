using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Users;

[ApiController]
[Route("api/users")]
[Authorize(Policy = "CanManageUsers")]
public class UsersController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var q = ctx.Users.AsQueryable();

        if (role is not null)
        {
            var roleEntity = await ctx.Roles.FirstOrDefaultAsync(r => r.Name == role);
            if (roleEntity is not null)
            {
                var userIds = await ctx.UserRoles.Where(ur => ur.RoleId == roleEntity.Id).Select(ur => ur.UserId).ToListAsync();
                q = q.Where(u => userIds.Contains(u.Id));
            }
        }

        var total = await q.CountAsync();
        var users = await q.OrderBy(u => u.FullName).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var result = new List<object>();
        foreach (var u in users)
        {
            var roles = await userManager.GetRolesAsync(u);
            result.Add(new { u.Id, u.FullName, u.Email, u.UserType, u.PhoneNumber, u.CreatedAt, Roles = roles });
        }

        return Ok(new { total, page, pageSize, items = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        if (!tenant.IsResolved) return BadRequest();

        var user = await userManager.FindByIdAsync(id);
        if (user is null || user.TenantId != tenant.TenantId) return NotFound();

        var roles = await userManager.GetRolesAsync(user);
        return Ok(new { user.Id, user.FullName, user.Email, user.UserType, user.PhoneNumber, user.CreatedAt, Roles = roles });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();

        var user = new ApplicationUser
        {
            UserName = req.Email, Email = req.Email, FullName = req.FullName,
            PhoneNumber = req.Phone, TenantId = tenant.TenantId, UserType = req.UserType, EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        foreach (var role in req.Roles)
            await userManager.AddToRoleAsync(user, role);

        return CreatedAtAction(nameof(Get), new { id = user.Id }, new { user.Id });
    }

    [HttpPatch("{id}/roles")]
    public async Task<IActionResult> UpdateRoles(string id, [FromBody] UpdateRolesRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();

        var user = await userManager.FindByIdAsync(id);
        if (user is null || user.TenantId != tenant.TenantId) return NotFound();

        var currentRoles = await userManager.GetRolesAsync(user);
        await userManager.RemoveFromRolesAsync(user, currentRoles);
        foreach (var role in req.Roles)
            await userManager.AddToRoleAsync(user, role);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!tenant.IsResolved) return BadRequest();

        var user = await userManager.FindByIdAsync(id);
        if (user is null || user.TenantId != tenant.TenantId) return NotFound();

        await userManager.DeleteAsync(user);
        return NoContent();
    }
}
