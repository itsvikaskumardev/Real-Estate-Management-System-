using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Users.Commands;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace RealEstate.Application.Users.Commands
{
    public record ForgotPasswordCommand : IRequest<ForgotPasswordResponse>
    {
        public string Email { get; init; } = string.Empty;
    }

    public record ForgotPasswordResponse
    {
        public string Message { get; init; } = string.Empty;
        public bool Success { get; init; }
    }

    public class ForgotPasswordCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IDateTimeProvider dateTimeProvider,
        IConfiguration configuration,
        ILogger<ForgotPasswordCommandHandler> logger)
        : IRequestHandler<ForgotPasswordCommand, ForgotPasswordResponse>
    {
        public async Task<ForgotPasswordResponse> Handle(
            ForgotPasswordCommand request,
            CancellationToken cancellationToken)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

            if (user is null)
                throw new NotFoundException("No user found with that email address", request.Email);

            var resetToken = GenerateResetToken();
            var hashedToken = HashToken(resetToken);

            user.ResetPasswordToken = hashedToken;
            user.ResetPasswordExpire = dateTimeProvider.UtcNow.AddMinutes(15);

            await context.SaveChangesAsync(cancellationToken);

            var clientUrl = configuration["ClientUrl"] ?? "http://localhost:5173";
            var resetUrl = $"{clientUrl}/reset-password/{resetToken}";
            var message = $"""
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Please click on the link below to reset your password:</p>
            <a href="{resetUrl}" clicktracking="off">{resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
            """;

            try
            {
                await emailService.SendAsync(
                    user.Email,
                    "Password Reset - Real Estate Platform",
                    message,
                    cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);

                user.ResetPasswordToken = null;
                user.ResetPasswordExpire = null;
                await context.SaveChangesAsync(cancellationToken);

                throw new InternalServerException("Could not send email");
            }

            return new ForgotPasswordResponse
            {
                Message = "Password reset email sent",
                Success = true
            };
        }

        private static string GenerateResetToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(20);
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static string HashToken(string token)
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(token);
            var hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }

}
