using System.Net;
using System.Text.Json;

namespace FacilityApp.Api.Middleware;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteErrorAsync(context, ex);
        }
    }

    private Task WriteErrorAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)HttpStatusCode.InternalServerError;

        var body = env.IsDevelopment()
            ? new { error = ex.Message, detail = ex.StackTrace }
            : (object)new { error = "An unexpected error occurred. Please try again later." };

        return context.Response.WriteAsync(JsonSerializer.Serialize(body));
    }
}
