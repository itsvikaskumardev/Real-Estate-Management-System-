using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace RealEstate.Application.Auth.Commands
{
    public record ResetPasswordCommand : IRequest<ResetPasswordResponse>
    {
        public string Token { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }

    public record ResetPasswordResponse
    {
        public string Message { get; init; } = string.Empty;
        public bool Success { get; init; }
    }

    public class ResetPasswordCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider)
        : IRequestHandler<ResetPasswordCommand, ResetPasswordResponse>
    {
        public async Task<ResetPasswordResponse> Handle(
            ResetPasswordCommand request,
            CancellationToken cancellationToken)
        {
            var hashedToken = HashToken(request.Token);
            var now = dateTimeProvider.UtcNow;

            var user = await context.Users
                .FirstOrDefaultAsync(u =>
                    u.ResetPasswordToken == hashedToken &&
                    u.ResetPasswordExpire > now,
                    cancellationToken);

            if (user is null)
                throw new BadRequestException("Invalid or expired password reset token");

            user.PasswordHash = passwordHasher.Hash(request.Password);
            user.ResetPasswordToken = null;
            user.ResetPasswordExpire = null;

            await context.SaveChangesAsync(cancellationToken);

            return new ResetPasswordResponse
            {
                Message = "Password updated successfully",
                Success = true
            };
        }

        private static string HashToken(string token)
        {
            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }
}
