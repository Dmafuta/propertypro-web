namespace FacilityApp.Api.Modules.Parcels;

public record ReceiveParcelRequest(
    Guid    UnitId,
    string  RecipientName,
    string? Courier        = null,
    string? Description    = null,
    string? TrackingNumber = null);

public record CollectParcelRequest(string CollectedBy);
