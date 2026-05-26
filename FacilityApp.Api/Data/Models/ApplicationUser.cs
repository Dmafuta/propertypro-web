using Microsoft.AspNetCore.Identity;

namespace FacilityApp.Api.Data.Models;

public class ApplicationUser : IdentityUser
{
    public string   FullName          { get; set; } = "";
    public Guid     TenantId          { get; set; }
    public UserType UserType          { get; set; } = UserType.Staff;
    public DateTime CreatedAt         { get; set; } = DateTime.UtcNow;
    public Guid?    CurrentEntranceId { get; set; }

    // Navigation
    public Tenant? Tenant { get; set; }
}
