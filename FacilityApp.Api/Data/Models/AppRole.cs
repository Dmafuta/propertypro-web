using Microsoft.AspNetCore.Identity;

namespace FacilityApp.Api.Data.Models;

public class AppRole : IdentityRole
{
    public string?   Description { get; set; }
    public bool      IsSystem    { get; set; }
    public bool      IsActive    { get; set; } = true;
    public DateTime  CreatedAt   { get; set; } = DateTime.UtcNow;
    public List<int> Permissions { get; set; } = [];
}
