namespace FacilityApp.Api.Modules.Visitors;

public record CreateVisitRequest(
    string   VisitorName,
    string   VisitorEmail,
    string?  VisitorPhone,
    string?  VisitorCompany,
    string   Purpose,
    DateTime ScheduledAt,
    string?  Notes  = null,
    string?  HostId = null);

public record CheckInRequest(Guid? EntranceId = null);
public record CheckOutRequest(Guid? EntranceId = null);
