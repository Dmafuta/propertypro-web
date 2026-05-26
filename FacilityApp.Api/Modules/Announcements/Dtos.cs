namespace FacilityApp.Api.Modules.Announcements;

public record AnnouncementRequest(
    string    Title,
    string    Body,
    string?   Category  = null,
    DateTime? ExpiresAt = null);
