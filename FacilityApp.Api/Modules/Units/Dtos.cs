namespace FacilityApp.Api.Modules.Units;

public record UnitBodyRequest(string Number, string? Floor = null, string? Block = null, string? Description = null);
public record AssignUserRequest(string? UserId);
public record SubmitUnitRequestDto(Guid UnitId, string? Note = null);
public record ReviewUnitRequestDto(string? ReviewNote = null);
