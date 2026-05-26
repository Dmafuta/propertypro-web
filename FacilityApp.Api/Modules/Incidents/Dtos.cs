using FacilityApp.Api.Data.Models;

namespace FacilityApp.Api.Modules.Incidents;

public record CreateIncidentRequest(
    string           Title,
    string           Description,
    IncidentSeverity Severity,
    string?          Location = null,
    string?          Parties  = null,
    string?          Category = null);

public record UpdateIncidentStatusRequest(IncidentStatus Status, string? Resolution = null);
