namespace FacilityApp.Api.Services;

public interface ISmsService
{
    Task<bool> SendAsync(string phoneNumber, string message);
}
