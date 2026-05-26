using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using FacilityApp.Api.Services;

namespace FacilityApp.Api.Data;

/// <summary>
/// Used only by EF Core design-time tools (migrations).
/// Provides a dummy TenantContext so the DbContext can be instantiated without DI.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connStr = config.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? throw new InvalidOperationException(
                "Set ConnectionStrings__DefaultConnection env var or appsettings.json before running migrations.");

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connStr)
            .Options;

        return new AppDbContext(options, new TenantContext());
    }
}
