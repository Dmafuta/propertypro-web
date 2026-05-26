namespace FacilityApp.Api.Data.Models;

public class Document
{
    public Guid    Id          { get; set; }
    public Guid    TenantId    { get; set; }
    public string  Title       { get; set; } = "";
    public string  FileName    { get; set; } = "";
    public string  FileUrl     { get; set; } = "";
    public string? Category    { get; set; }
    public string? ContentType { get; set; }
    public long    FileSize    { get; set; }
    public bool    IsActive    { get; set; } = true;
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
}
