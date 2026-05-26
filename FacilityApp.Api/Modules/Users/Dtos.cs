using FacilityApp.Api.Data.Models;

namespace FacilityApp.Api.Modules.Users;

public record CreateUserRequest(
    string   Email,
    string   FullName,
    string   Password,
    UserType UserType,
    string[] Roles,
    string?  Phone = null);

public record UpdateRolesRequest(string[] Roles);
