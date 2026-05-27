using System.Net.Http.Headers;

namespace FacilityApp.Api.Services;

public class AfricasTalkingService(HttpClient http, IConfiguration config) : ISmsService
{
    private readonly string  _username   = config["AfricasTalking:Username"] ?? "sandbox";
    private readonly string  _apiKey     = config["AfricasTalking:ApiKey"]   ?? throw new InvalidOperationException("AfricasTalking:ApiKey not configured");
    private readonly string? _senderId   = config["AfricasTalking:SenderId"];
    private readonly bool    _useSandbox = bool.Parse(config["AfricasTalking:UseSandbox"] ?? "true");

    public async Task<bool> SendAsync(string phoneNumber, string message)
    {
        http.Timeout = TimeSpan.FromSeconds(5);

        var baseUrl = _useSandbox
            ? "https://api.sandbox.africastalking.com"
            : "https://api.africastalking.com";

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/version1/messaging");
        request.Headers.Add("apiKey", _apiKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var form = new Dictionary<string, string>
        {
            ["username"] = _username,
            ["to"]       = phoneNumber,
            ["message"]  = message,
        };
        if (!string.IsNullOrEmpty(_senderId))
            form["from"] = _senderId;

        request.Content = new FormUrlEncodedContent(form);

        var response = await http.SendAsync(request);
        return response.IsSuccessStatusCode;
    }
}
