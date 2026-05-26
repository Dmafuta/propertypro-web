namespace FacilityApp.Api.Modules.Settings;

public record UpdateSettingsRequest(
    string  Name,
    string? ContactEmail  = null,
    string? ContactPhone  = null,
    string? Address       = null,
    string? Website       = null,
    string? PrimaryColour = null,
    string? CustomDomain  = null);
