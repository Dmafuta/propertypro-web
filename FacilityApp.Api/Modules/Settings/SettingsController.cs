using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Settings;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    IWebHostEnvironment env) : ControllerBase
{
    // ── GET /api/settings ─────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var t = await ctx.Tenants.FirstOrDefaultAsync(x => x.Id == tenant.TenantId);
        if (t is null) return NotFound();

        return Ok(new
        {
            t.Id, t.Name, t.Slug, t.Plan, t.CustomDomain,
            t.ContactEmail, t.ContactPhone, t.Address, t.Website,
            t.PrimaryColour, t.LogoUrl, t.CreatedAt,
        });
    }

    // ── PUT /api/settings ─────────────────────────────────────────────────────
    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update([FromBody] UpdateSettingsRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var t = await ctx.Tenants.FirstOrDefaultAsync(x => x.Id == tenant.TenantId);
        if (t is null) return NotFound();

        if (req.CustomDomain is not null && t.Plan < TenantPlan.Professional)
            return BadRequest(new { error = "Custom domain requires Professional plan" });

        t.Name         = req.Name;
        t.ContactEmail = req.ContactEmail;
        t.ContactPhone = req.ContactPhone;
        t.Address      = req.Address;
        t.Website      = req.Website;
        t.PrimaryColour= req.PrimaryColour;
        if (req.CustomDomain is not null)
            t.CustomDomain = string.IsNullOrWhiteSpace(req.CustomDomain) ? null : req.CustomDomain.ToLower().Trim();

        await ctx.SaveChangesAsync();
        return NoContent();
    }

    // ── POST /api/settings/logo ───────────────────────────────────────────────
    [HttpPost("logo")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadLogo(IFormFile file)
    {
        if (!tenant.IsResolved) return BadRequest();
        if (file.Length == 0) return BadRequest(new { error = "File is empty" });
        if (file.Length > 2 * 1024 * 1024) return BadRequest(new { error = "Logo must be under 2 MB" });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/svg+xml" };
        if (!allowed.Contains(file.ContentType))
            return BadRequest(new { error = "Only JPEG, PNG, WebP or SVG allowed" });

        var dir = Path.Combine(env.WebRootPath ?? "wwwroot", "logos");
        Directory.CreateDirectory(dir);

        var ext      = Path.GetExtension(file.FileName);
        var fileName = $"{tenant.Slug}{ext}";
        var filePath = Path.Combine(dir, fileName);

        await using (var stream = System.IO.File.Create(filePath))
            await file.CopyToAsync(stream);

        var logoUrl = $"/logos/{fileName}";

        await using var ctx = await factory.CreateDbContextAsync();
        var t = await ctx.Tenants.FirstOrDefaultAsync(x => x.Id == tenant.TenantId);
        if (t is not null) { t.LogoUrl = logoUrl; await ctx.SaveChangesAsync(); }

        return Ok(new { logoUrl });
    }
}
