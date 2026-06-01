namespace FacilityApp.Api.Modules.Roles;

public record CreateRoleRequest(
    string     Name,
    string?    Description = null,
    List<int>? Permissions = null);

public record UpdateRoleRequest(
    string? Name        = null,
    string? Description = null);

public record UpdatePermissionsRequest(List<int>? Permissions);
