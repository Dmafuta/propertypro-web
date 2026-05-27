using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FacilityApp.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options, TenantContext tenantContext)
    : IdentityDbContext<ApplicationUser>(options)
{
    private Guid CurrentTenantId => tenantContext.TenantId;

    public DbSet<Tenant>            Tenants            { get; set; }
    public DbSet<Unit>              Units              { get; set; }
    public DbSet<UserUnit>          UserUnits          { get; set; }
    public DbSet<Visitor>           Visitors           { get; set; }
    public DbSet<Visit>             Visits             { get; set; }
    public DbSet<Entrance>          Entrances          { get; set; }
    public DbSet<MaintenanceRequest>MaintenanceRequests{ get; set; }
    public DbSet<Announcement>      Announcements      { get; set; }
    public DbSet<Document>          Documents          { get; set; }
    public DbSet<IncidentReport>    IncidentReports    { get; set; }
    public DbSet<Parcel>            Parcels            { get; set; }
    public DbSet<Vehicle>           Vehicles           { get; set; }
    public DbSet<VehicleTag>        VehicleTags        { get; set; }
    public DbSet<ParkingRecord>     ParkingRecords     { get; set; }
    public DbSet<UnitRequest>       UnitRequests       { get; set; }
    public DbSet<AuditLog>          AuditLogs          { get; set; }
    public DbSet<RefreshToken>      RefreshTokens      { get; set; }
    public DbSet<OtpCode>           OtpCodes           { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Rename Identity tables
        builder.Entity<ApplicationUser>().ToTable("users");
        builder.HasDefaultSchema("public");

        // Global query filters — all tenant-scoped entities
        builder.Entity<Unit>()              .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<UserUnit>()          .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<Visitor>()           .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<Visit>()             .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<Entrance>()          .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<MaintenanceRequest>().HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<Announcement>()      .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<Document>()          .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<IncidentReport>()    .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<Parcel>()            .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<Vehicle>()           .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<VehicleTag>()        .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<ParkingRecord>()     .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<UnitRequest>()       .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<AuditLog>()          .HasQueryFilter(e => e.TenantId == CurrentTenantId);
        builder.Entity<ApplicationUser>()   .HasQueryFilter(e => e.TenantId == CurrentTenantId);

        // Indexes
        builder.Entity<Tenant>().HasIndex(t => t.Slug).IsUnique();
        builder.Entity<Tenant>().HasIndex(t => t.CustomDomain);
        builder.Entity<RefreshToken>().HasIndex(t => t.Token).IsUnique();
        builder.Entity<RefreshToken>().HasIndex(t => t.UserId);

        // OtpCode — no tenant filter, queried by UserId + Purpose
        builder.Entity<OtpCode>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<OtpCode>().HasIndex(o => new { o.UserId, o.Purpose, o.IsUsed, o.ExpiresAt });
    }
}
