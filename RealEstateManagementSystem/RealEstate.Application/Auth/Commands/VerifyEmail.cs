using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Auth.Commands
{
    public record VerifyEmailCommand : IRequest<VerifyEmailResponse>
    {
        public string Email { get; init; } = string.Empty;
        public string Code { get; init; } = string.Empty;
    }

    public record VerifyEmailResponse
    {
        public string Message { get; init; } = string.Empty;
        public bool Success { get; init; }
    }

    public class VerifyEmailCommandHandler(IApplicationDbContext dbContext)
        : IRequestHandler<VerifyEmailCommand, VerifyEmailResponse>
    {
        public async Task<VerifyEmailResponse> Handle(
            VerifyEmailCommand request,
            CancellationToken ct)
        {
            var user = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email, ct);

            if (user is null)
                throw new NotFoundException(nameof(User), request.Email);

            if (user.IsVerified)
                throw new BadRequestException("Email already verified");

            // Bypass check: if the code is 123456, allow it, otherwise check against the DB token.
            if (request.Code != "123456" && user.VerificationToken != request.Code)
                throw new BadRequestException("Invalid verification code");

            user.IsVerified = true;
            user.VerificationToken = null;

            await dbContext.SaveChangesAsync(ct);

            return new VerifyEmailResponse
            {
                Message = "Email verified successfully",
                Success = true
            };
        }
    }
}
