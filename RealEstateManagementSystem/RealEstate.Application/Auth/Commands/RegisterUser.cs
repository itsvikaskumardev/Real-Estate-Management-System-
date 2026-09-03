using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Auth.Commands
{

    public record RegisterUserCommand : IRequest<RegisterUserResponse>
    {
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
        public UserRole Role { get; init; }
    }

    public record RegisterUserResponse
    {
        public string Message { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public UserRole Role { get; init; }
    }

    public class RegisterUserCommandHandler(
        IApplicationDbContext dbContext,
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        ILogger<RegisterUserCommandHandler> logger)
        : IRequestHandler<RegisterUserCommand, RegisterUserResponse>
    {
        public async Task<RegisterUserResponse> Handle(
            RegisterUserCommand request,
            CancellationToken ct)
        {
            var userExists = await dbContext.Users
                .AnyAsync(u => u.Email == request.Email, ct);

            if (userExists)
                throw new ConflictException("User already exists");

            // Hardcoded to 123456 temporarily for testing
            var verificationToken = "123456";

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = passwordHasher.Hash(request.Password),
                Role = request.Role,
                IsApproved = request.Role != UserRole.Seller,
                VerificationToken = verificationToken
            };

            await dbContext.Users.AddAsync(user);
            await dbContext.SaveChangesAsync(ct);

            try
            {
                await emailService.SendAsync(
                    user.Email,
                    "Verify Your Email - Real Estate Platform",
                    $"<p>Your email verification code is: <strong>{verificationToken}</strong></p>" +
                    "<p>Please enter this code on the verification page to activate your account.</p>",
                    ct);
            }
            catch (Exception ex)
            {
                // Don't block registration if email fails — same behavior as your original
                logger.LogError(ex, "Failed to send verification email to {Email}", user.Email);
            }

            return new RegisterUserResponse
            {
                Message = "User registered. Please check your email for the verification code.",
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            };
        }
    }
}
