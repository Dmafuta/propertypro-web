using FacilityApp.Api.Data.Models;

namespace FacilityApp.Api.Modules.Parking;

public record RegisterVehicleRequest(
    string      Make,
    string      Model,
    string      Plate,
    VehicleType Type,
    string?     Colour  = null,
    string?     OwnerId = null);

public record IssueTagRequest(string TagNumber, DateTime? ExpiresAt = null);
public record UpdateTagStatusRequest(TagStatus Status);

public record LogEntryRequest(
    string             Plate,
    string?            TagNumber  = null,
    ParkingRecordType? RecordType = null,
    string?            Notes      = null);
