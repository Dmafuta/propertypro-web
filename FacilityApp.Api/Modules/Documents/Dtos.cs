namespace FacilityApp.Api.Modules.Documents;

public record DocumentUploadRequest(IFormFile File, string Title, string? Category = null);
