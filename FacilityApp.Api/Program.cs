using System.Text;
using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using FacilityApp.Api.Middleware;
using FacilityApp.Api.Modules.Auth;
using FacilityApp.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// ── Connection string ──────────────────────────────────────────────────────────
var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection not configured");

// ── NpgsqlDataSource (singleton — used by TenantService and CORS) ─────────────
var npgsqlDataSource = NpgsqlDataSource.Create(connStr);
builder.Services.AddSingleton(npgsqlDataSource);

// ── EF Core ────────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connStr));
builder.Services.AddDbContextFactory<AppDbContext>(
    o => o.UseNpgsql(connStr), ServiceLifetime.Scoped);

// ── Identity ───────────────────────────────────────────────────────────────────
builder.Services.AddIdentityCore<ApplicationUser>(o =>
{
    o.Password.RequiredLength         = 8;
    o.Password.RequireNonAlphanumeric = false;
    o.User.RequireUniqueEmail         = true;
})
.AddRoles<IdentityRole>()
.AddSignInManager()
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ── JWT ────────────────────────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? Environment.GetEnvironmentVariable("Jwt__Secret")
    ?? throw new InvalidOperationException("Jwt:Secret not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"]  ?? "FacilityApp",
            ValidAudience            = builder.Configuration["Jwt:Audience"] ?? "FacilityApp",
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew                = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CanManageUsers",    p => p.RequireRole("Admin"))
    .AddPolicy("CanManageUnits",    p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("CanViewReports",    p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("CanManageVisitors", p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("CanCheckInVisitors",p => p.RequireRole("Admin", "Manager", "Security"))
    .AddPolicy("CanPreRegisterVisits", p => p.RequireRole("Admin", "Manager", "Receptionist", "Occupant"))
    .AddPolicy("CanLogIncidents",   p => p.RequireRole("Admin", "Manager", "Receptionist", "Security"))
    .AddPolicy("CanManageIncidents",p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("CanAccessParking",  p => p.RequireRole("Admin", "Manager", "Security"))
    .AddPolicy("CanManageParking",  p => p.RequireRole("Admin", "Manager"));

// ── CORS ───────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(o => o.AddPolicy("FrontendPolicy", policy =>
{
    policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
}));

// ── App services ───────────────────────────────────────────────────────────────
builder.Services.AddScoped<TenantContext>();
builder.Services.AddScoped<TenantService>();
builder.Services.AddScoped<TokenService>();

// ── Controllers + OpenAPI ──────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ── Health check ───────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddCheck("postgres", () =>
    {
        try
        {
            using var conn = npgsqlDataSource.OpenConnection();
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy(ex.Message);
        }
    });

// ──────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Migrate + seed roles ───────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db          = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var roleMgr     = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    await db.Database.MigrateAsync();

    string[] roles = ["SuperAdmin", "Admin", "Manager", "Receptionist", "Security", "Occupant"];
    foreach (var role in roles)
        if (!await roleMgr.RoleExistsAsync(role))
            await roleMgr.CreateAsync(new IdentityRole(role));
}

// ── Middleware pipeline ────────────────────────────────────────────────────────
app.UseMiddleware<ErrorHandlingMiddleware>();   // must be first

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseForwardedHeaders();
app.UseCors("FrontendPolicy");

// Tenant middleware runs before auth so TenantContext is populated for query filters
app.UseRouting();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// ── Dev seed endpoints ─────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapGet("/dev/seed-superadmin", async (
        UserManager<ApplicationUser> userMgr,
        AppDbContext db) =>
    {
        const string email    = "superadmin@facilityapp.io";
        const string password = "SuperAdmin1!";

        // Ensure platform tenant exists
        var platform = await db.Tenants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Slug == "platform");

        if (platform is null)
        {
            platform = new FacilityApp.Api.Data.Models.Tenant
            {
                Id       = Guid.NewGuid(),
                Name     = "Platform",
                Slug     = "platform",
                IsActive = true,
                IsSystem = true,
                Plan     = FacilityApp.Api.Data.Models.TenantPlan.Professional,
            };
            db.Tenants.Add(platform);
            await db.SaveChangesAsync();
        }

        if (await userMgr.FindByEmailAsync(email) is null)
        {
            var user = new ApplicationUser
            {
                UserName  = email,
                Email     = email,
                FullName  = "Super Admin",
                TenantId  = platform.Id,
                UserType  = FacilityApp.Api.Data.Models.UserType.Staff,
                EmailConfirmed = true,
            };
            await userMgr.CreateAsync(user, password);
            await userMgr.AddToRoleAsync(user, "SuperAdmin");
        }

        return Results.Ok(new { email, password });
    });

    app.MapGet("/dev/seed-admin", async (
        string tenantSlug, string email, string password,
        UserManager<ApplicationUser> userMgr,
        AppDbContext db) =>
    {
        var tenant = await db.Tenants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Slug == tenantSlug);

        if (tenant is null)
        {
            tenant = new FacilityApp.Api.Data.Models.Tenant
            {
                Id       = Guid.NewGuid(),
                Name     = tenantSlug,
                Slug     = tenantSlug,
                IsActive = true,
                Plan     = FacilityApp.Api.Data.Models.TenantPlan.Starter,
            };
            db.Tenants.Add(tenant);
            await db.SaveChangesAsync();
        }

        if (await userMgr.FindByEmailAsync(email) is null)
        {
            var user = new ApplicationUser
            {
                UserName  = email,
                Email     = email,
                FullName  = "Admin",
                TenantId  = tenant.Id,
                UserType  = FacilityApp.Api.Data.Models.UserType.Staff,
                EmailConfirmed = true,
            };
            await userMgr.CreateAsync(user, password);
            await userMgr.AddToRoleAsync(user, "Admin");
        }

        return Results.Ok(new { tenantSlug, email });
    });
}

app.Run();
