using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Modules.Documents;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController(
    IDbContextFactory<AppDbContext> factory,
    TenantContext tenant,
    IWebHostEnvironment env) : ControllerBase
{
    private static readonly string[] AllowedMimes =
    [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg", "image/png",
    ];

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] bool? active)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var q = ctx.Documents.AsQueryable();
        if (active.HasValue) q = q.Where(d => d.IsActive == active);

        var items = await q.OrderBy(d => d.Category).ThenBy(d => d.Title)
            .Select(d => new { d.Id, d.Title, d.FileName, d.FileUrl, d.Category, d.ContentType, d.FileSize, d.IsActive, d.CreatedAt })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Upload([FromForm] DocumentUploadRequest req)
    {
        if (!tenant.IsResolved) return BadRequest();
        if (req.File.Length == 0) return BadRequest(new { error = "File is empty" });
        if (req.File.Length > 10 * 1024 * 1024) return BadRequest(new { error = "File exceeds 10 MB limit" });
        if (!AllowedMimes.Contains(req.File.ContentType)) return BadRequest(new { error = "File type not allowed" });

        var dir = Path.Combine(env.WebRootPath ?? "wwwroot", "documents", tenant.Slug);
        Directory.CreateDirectory(dir);

        var safeName = Path.GetFileNameWithoutExtension(req.File.FileName).Replace(" ", "_").Replace("..", "")
            + "_" + Guid.NewGuid().ToString("N")[..8] + Path.GetExtension(req.File.FileName);

        await using (var stream = System.IO.File.Create(Path.Combine(dir, safeName)))
            await req.File.CopyToAsync(stream);

        await using var ctx = await factory.CreateDbContextAsync();
        var doc = new Document
        {
            TenantId = tenant.TenantId, Title = req.Title, FileName = req.File.FileName,
            FileUrl = $"/documents/{tenant.Slug}/{safeName}", Category = req.Category,
            ContentType = req.File.ContentType, FileSize = req.File.Length,
        };
        ctx.Documents.Add(doc);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(List), new { }, new { doc.Id, doc.FileUrl });
    }

    [HttpPatch("{id:guid}/toggle")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var d = await ctx.Documents.FindAsync(id);
        if (d is null) return NotFound();

        d.IsActive = !d.IsActive;
        await ctx.SaveChangesAsync();
        return Ok(new { d.IsActive });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!tenant.IsResolved) return BadRequest();
        await using var ctx = await factory.CreateDbContextAsync();

        var d = await ctx.Documents.FindAsync(id);
        if (d is null) return NotFound();

        var filePath = Path.Combine(env.WebRootPath ?? "wwwroot", d.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);

        ctx.Documents.Remove(d);
        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
