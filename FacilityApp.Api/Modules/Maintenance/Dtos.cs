using FacilityApp.Api.Data.Models;

namespace FacilityApp.Api.Modules.Maintenance;

public record CreateMaintenanceRequest(
    string              Title,
    string              Description,
    MaintenanceCategory Category,
    MaintenancePriority Priority,
    Guid?               UnitId = null);

public record UpdateMaintenanceStatusRequest(
    MaintenanceStatus Status,
    string?           StaffNote    = null,
    string?           AssignedToId = null);
