using System.Security.Cryptography;
using System.Text;
using FacilityApp.Api.Data;
using FacilityApp.Api.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace FacilityApp.Api.Services;

public class OtpService(IDbContextFactory<AppDbContext> factory, ISmsService sms, ILogger<OtpService> logger, IWebHostEnvironment env)
{
    private const int ExpiryMinutes  = 5;
    private const int MaxAttempts    = 5;
    private const int ResendCooldown = 30; // seconds

    /// <summary>
    /// Generates a fresh 6-digit OTP, invalidates old ones, sends it via SMS.
    /// </summary>
    public async Task<bool> SendOtpAsync(string userId, string phoneNumber, string purpose)
    {
        await using var ctx = await factory.CreateDbContextAsync();

        // Invalidate any active codes for this user + purpose
        await ctx.OtpCodes
            .Where(o => o.UserId == userId && o.Purpose == purpose && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .ExecuteUpdateAsync(s => s.SetProperty(o => o.IsUsed, true));

        var plain = GeneratePlainCode();
        ctx.OtpCodes.Add(new OtpCode
        {
            UserId    = userId,
            CodeHash  = Hash(plain),
            Purpose   = purpose,
            ExpiresAt = DateTime.UtcNow.AddMinutes(ExpiryMinutes),
        });
        await ctx.SaveChangesAsync();

        bool sent;
        try
        {
            sent = await sms.SendAsync(
                phoneNumber,
                $"Your FacilityApp code is {plain}. Valid for {ExpiryMinutes} minutes. Do not share it with anyone.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "SMS exception for user {UserId} purpose {Purpose}", userId, purpose);
            sent = false;
        }

        if (!sent)
        {
            logger.LogWarning("SMS delivery failed for user {UserId} purpose {Purpose}", userId, purpose);

            // In Development: log the code so it can be used without a real SMS provider
            if (env.IsDevelopment())
            {
                logger.LogWarning("[DEV] OTP for {UserId} ({Purpose}): {Code}", userId, purpose, plain);
                return true;
            }
        }

        return sent;
    }

    /// <summary>
    /// Verifies the code. Returns true and marks it used if valid; increments attempts otherwise.
    /// </summary>
    public async Task<bool> VerifyOtpAsync(string userId, string code, string purpose)
    {
        await using var ctx = await factory.CreateDbContextAsync();

        var record = await ctx.OtpCodes
            .Where(o => o.UserId == userId && o.Purpose == purpose && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (record is null) return false;

        if (record.Attempts >= MaxAttempts)
        {
            record.IsUsed = true;
            await ctx.SaveChangesAsync();
            return false;
        }

        if (record.CodeHash != Hash(code))
        {
            record.Attempts++;
            await ctx.SaveChangesAsync();
            return false;
        }

        record.IsUsed = true;
        await ctx.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Returns true if an OTP was sent within the cooldown window (prevents SMS spam).
    /// </summary>
    public async Task<bool> HasRecentOtpAsync(string userId, string purpose)
    {
        await using var ctx = await factory.CreateDbContextAsync();
        var cutoff = DateTime.UtcNow.AddSeconds(-ResendCooldown);
        return await ctx.OtpCodes
            .AnyAsync(o => o.UserId == userId && o.Purpose == purpose && o.CreatedAt > cutoff);
    }

    private static string GeneratePlainCode()
    {
        var bytes = RandomNumberGenerator.GetBytes(4);
        var value = BitConverter.ToUInt32(bytes, 0) % 1_000_000;
        return value.ToString("D6");
    }

    private static string Hash(string input)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input)));
}
