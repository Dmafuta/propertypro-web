namespace FacilityApp.Api.Data.Models;

/// <summary>
/// Granular permission flags stored on each <see cref="AppRole"/>.
/// Values must stay in sync with the PERMISSIONS constant in useRolesApi.ts.
/// </summary>
public enum Permission
{
    CanCheckInVisitors     = 1,
    CanPreRegisterVisits   = 2,
    CanManageVisitors      = 3,
    CanManageAccess        = 4,
    CanViewReports         = 5,
    CanViewDashboard       = 6,
    CanManageAuditLog      = 7,
    CanManageUsers         = 8,
    CanManageUnits         = 9,
    CanManageSettings      = 10,
    CanManageFacilities    = 11,
    CanManageEntrances     = 12,
    CanLogIncidents        = 13,
    CanManageIncidents     = 14,
    CanAccessParking       = 15,
    CanManageParking       = 16,
    CanManageParcels       = 17,
    CanManageMaintenance   = 18,
    CanManagePayments      = 19,
    CanManageDocuments     = 20,
    CanManageAnnouncements = 21,
    CanManageHr            = 22,
}
