using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Auth.Dto;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Admin.Commands
{
    public record CreateAdminCommand : IRequest<CreateAdminResponse>
    {
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }

    public record CreateAdminResponse
    {
        public string Message { get; init; } = string.Empty;
        public UserDto Admin { get; init; } = null!;
    }

    public class CreateAdminCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        ILogger<CreateAdminCommandHandler> logger)
        : IRequestHandler<CreateAdminCommand, CreateAdminResponse>
    {
        public async Task<CreateAdminResponse> Handle(
            CreateAdminCommand request,
            CancellationToken cancellationToken)
        {
            var userExists = await context.Users
                .AnyAsync(u => u.Email == request.Email, cancellationToken);

            if (userExists)
                throw new ConflictException("User with this email already exists.");

            var adminUser = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = passwordHasher.Hash(request.Password),
                Role = UserRole.Admin,
                IsApproved = true,
                IsVerified = true, // Admins created by admins are implicitly verified
                IsBlocked = false
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync(cancellationToken);

            logger.LogInformation("New admin user created: {Email}", adminUser.Email);

            return new CreateAdminResponse
            {
                Message = "Admin created successfully.",
                Admin = new UserDto
                {
                    Id = adminUser.Id,
                    Name = adminUser.Name,
                    Email = adminUser.Email,
                    Role = adminUser.Role.ToString().ToLower(),
                    IsApproved = adminUser.IsApproved
                }
            };
        }
    }
}
