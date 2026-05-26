namespace FacilityApp.Api.Data.Models;

public enum VehicleType { Car, Motorcycle, Truck, Van, Other }
public enum TagStatus    { Active, Suspended, Revoked, Expired }

public class Vehicle
{
    public Guid        Id           { get; set; }
    public Guid        TenantId     { get; set; }
    public string      OwnerId      { get; set; } = "";
    public string      Make         { get; set; } = "";
    public string      Model        { get; set; } = "";
    public string      Plate        { get; set; } = "";
    public string?     Colour       { get; set; }
    public VehicleType Type         { get; set; }
    public DateTime    CreatedAt    { get; set; } = DateTime.UtcNow;

    public ApplicationUser? Owner { get; set; }
    public VehicleTag?      Tag   { get; set; }
}

public class VehicleTag
{
    public Guid      Id          { get; set; }
    public Guid      TenantId    { get; set; }
    public Guid      VehicleId   { get; set; }
    public string    TagNumber   { get; set; } = "";
    public TagStatus Status      { get; set; } = TagStatus.Active;
    public string    IssuedById  { get; set; } = "";
    public DateTime  IssuedAt    { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt   { get; set; }

    public Vehicle?         Vehicle  { get; set; }
    public ApplicationUser? IssuedBy { get; set; }
}

public enum ParkingRecordType { Resident, Visitor, Unknown }

public class ParkingRecord
{
    public Guid              Id          { get; set; }
    public Guid              TenantId    { get; set; }
    public string?           TagNumber   { get; set; }
    public string            Plate       { get; set; } = "";
    public ParkingRecordType RecordType  { get; set; }
    public string?           LoggedById  { get; set; }
    public DateTime          EnteredAt   { get; set; } = DateTime.UtcNow;
    public DateTime?         ExitedAt    { get; set; }
    public string?           Notes       { get; set; }
}
