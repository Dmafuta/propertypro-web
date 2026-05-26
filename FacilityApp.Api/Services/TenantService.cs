using Npgsql;

namespace FacilityApp.Api.Services;

public class TenantService(NpgsqlDataSource dataSource)
{
    public async Task<TenantContext?> ResolveBySlugAsync(string slug)
    {
        const string sql = """
            SELECT "Id","Name","Slug","Plan","PrimaryColour","LogoUrl"
            FROM   "Tenants"
            WHERE  "Slug" = $1 AND "IsActive" = true
            LIMIT  1
            """;

        await using var conn = await dataSource.OpenConnectionAsync();
        await using var cmd  = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue(slug);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return Map(reader, isCustomDomain: false);
    }

    public async Task<TenantContext?> ResolveByDomainAsync(string host)
    {
        const string sql = """
            SELECT "Id","Name","Slug","Plan","PrimaryColour","LogoUrl"
            FROM   "Tenants"
            WHERE  "CustomDomain" = $1 AND "IsActive" = true
            LIMIT  1
            """;

        await using var conn = await dataSource.OpenConnectionAsync();
        await using var cmd  = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue(host);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return Map(reader, isCustomDomain: true);
    }

    private static TenantContext Map(NpgsqlDataReader r, bool isCustomDomain) => new()
    {
        TenantId       = r.GetGuid(0),
        Name           = r.GetString(1),
        Slug           = r.GetString(2),
        Plan           = (Data.Models.TenantPlan)r.GetInt32(3),
        PrimaryColour  = r.IsDBNull(4) ? null : r.GetString(4),
        LogoUrl        = r.IsDBNull(5) ? null : r.GetString(5),
        IsResolved     = true,
        IsCustomDomain = isCustomDomain,
    };
}
