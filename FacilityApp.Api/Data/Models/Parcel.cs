namespace FacilityApp.Api.Data.Models;

public enum ParcelStatus { Pending, Collected, Returned }

public class Parcel
{
    public Guid         Id              { get; set; }
    public Guid         TenantId        { get; set; }
    public Guid         UnitId          { get; set; }
    public string       RecipientName   { get; set; } = "";
    public string?      Courier         { get; set; }
    public string?      Description     { get; set; }
    public string?      TrackingNumber  { get; set; }
    public ParcelStatus Status          { get; set; } = ParcelStatus.Pending;
    public string?      CollectedBy     { get; set; }
    public DateTime?    CollectedAt     { get; set; }
    public DateTime?    ReturnedAt      { get; set; }
    public string       LoggedById      { get; set; } = "";
    public DateTime     CreatedAt       { get; set; } = DateTime.UtcNow;

    public Unit?            Unit     { get; set; }
    public ApplicationUser? LoggedBy { get; set; }
}
