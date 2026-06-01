using FacilityApp.Api.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Roles;

[ApiController]
[Route("api/superadmin/roles")]
[Authorize(Roles = "SuperAdmin")]
public class RolesController(RoleManager<AppRole> roleManager) : ControllerBase
{
    // ── GET /api/superadmin/roles ─────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var roles = await roleManager.Roles
            .OrderBy(r => r.IsSystem ? 0 : 1)
            .ThenBy(r => r.Name)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.Description,
                r.IsSystem,
                r.IsActive,
                r.CreatedAt,
                Permissions = r.Permissions,
            })
            .ToListAsync();

        return Ok(roles);
    }

    // ── GET /api/superadmin/roles/permissions/all ─────────────────────────────

    [HttpGet("permissions/all")]
    public IActionResult GetAllPermissions()
    {
        var perms = Enum.GetValues<Permission>()
            .Select(p => new { value = (int)p, name = p.ToString() });

        return Ok(perms);
    }

    // ── GET /api/superadmin/roles/{id} ────────────────────────────────────────

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var role = await roleManager.FindByIdAsync(id);
        if (role is null) return NotFound();

        return Ok(new
        {
            role.Id,
            role.Name,
            role.Description,
            role.IsSystem,
            role.IsActive,
            role.CreatedAt,
            Permissions = role.Permissions,
        });
    }

    // ── POST /api/superadmin/roles ────────────────────────────────────────────

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { error = "Name is required." });

        var role = new AppRole
        {
            Name        = req.Name.Trim(),
            Description = req.Description?.Trim(),
            Permissions = req.Permissions ?? [],
            IsSystem    = false,
            IsActive    = true,
        };

        var result = await roleManager.CreateAsync(role);
        if (!result.Succeeded)
            return BadRequest(new { error = result.Errors.FirstOrDefault()?.Description ?? "Failed to create role." });

        return CreatedAtAction(nameof(Get), new { id = role.Id }, new
        {
            role.Id,
            role.Name,
            role.Description,
            role.IsSystem,
            role.IsActive,
            role.CreatedAt,
            Permissions = role.Permissions,
        });
    }

    // ── PATCH /api/superadmin/roles/{id} ──────────────────────────────────────

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateRoleRequest req)
    {
        var role = await roleManager.FindByIdAsync(id);
        if (role is null) return NotFound();
        if (role.IsSystem) return BadRequest(new { error = "System roles cannot be renamed." });

        if (req.Name is not null) role.Name = req.Name.Trim();
        if (req.Description is not null) role.Description = req.Description.Trim() is "" ? null : req.Description.Trim();

        var result = await roleManager.UpdateAsync(role);
        if (!result.Succeeded)
            return BadRequest(new { error = result.Errors.FirstOrDefault()?.Description });

        return NoContent();
    }

    // ── PUT /api/superadmin/roles/{id}/permissions ────────────────────────────

    [HttpPut("{id}/permissions")]
    public async Task<IActionResult> UpdatePermissions(string id, [FromBody] UpdatePermissionsRequest req)
    {
        var role = await roleManager.FindByIdAsync(id);
        if (role is null) return NotFound();
        if (role.IsSystem) return BadRequest(new { error = "System role permissions are managed by the platform." });

        // Validate: only accept known permission values
        var validValues = Enum.GetValues<Permission>().Select(p => (int)p).ToHashSet();
        var permissions = (req.Permissions ?? []).Where(v => validValues.Contains(v)).ToList();

        role.Permissions = permissions;

        var result = await roleManager.UpdateAsync(role);
        if (!result.Succeeded)
            return BadRequest(new { error = result.Errors.FirstOrDefault()?.Description });

        return NoContent();
    }

    // ── PATCH /api/superadmin/roles/{id}/toggle ───────────────────────────────

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> Toggle(string id)
    {
        var role = await roleManager.FindByIdAsync(id);
        if (role is null) return NotFound();
        if (role.IsSystem) return BadRequest(new { error = "System roles cannot be deactivated." });

        role.IsActive = !role.IsActive;

        var result = await roleManager.UpdateAsync(role);
        if (!result.Succeeded)
            return BadRequest(new { error = result.Errors.FirstOrDefault()?.Description });

        return Ok(new { role.IsActive });
    }

    // ── DELETE /api/superadmin/roles/{id} ─────────────────────────────────────

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var role = await roleManager.FindByIdAsync(id);
        if (role is null) return NotFound();
        if (role.IsSystem) return BadRequest(new { error = "System roles cannot be deleted." });

        var result = await roleManager.DeleteAsync(role);
        if (!result.Succeeded)
            return BadRequest(new { error = result.Errors.FirstOrDefault()?.Description });

        return NoContent();
    }
}
