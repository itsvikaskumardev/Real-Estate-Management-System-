using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Auth.Dto;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Auth.Commands
{
    public record SetupFirstAdminCommand : IRequest<SetupFirstAdminResponse>
    {
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }

    public record SetupFirstAdminResponse
    {
        public string Message { get; init; } = string.Empty;
        public UserDto Admin { get; init; } = null!;
    }

    public class SetupFirstAdminCommandHandler(
        IApplicationDbContext dbContext,
        IPasswordHasher passwordHasher,
        ILogger<SetupFirstAdminCommandHandler> logger)
        : IRequestHandler<SetupFirstAdminCommand, SetupFirstAdminResponse>
    {
        public async Task<SetupFirstAdminResponse> Handle(
            SetupFirstAdminCommand request,
            CancellationToken ct)
        {
            var adminExists = await dbContext.Users
                .AnyAsync(u => u.Role == UserRole.Admin, ct);

            if (adminExists)
                throw new ConflictException("An admin already exists. Setup is disabled.");

            var userExists = await dbContext.Users
                .AnyAsync(u => u.Email == request.Email, ct);

            if (userExists)
                throw new ConflictException("User with this email already exists.");

            var adminUser = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = passwordHasher.Hash(request.Password),
                Role = UserRole.Admin,
                IsApproved = true,
                IsVerified = true,
                IsBlocked = false
            };

            await dbContext.Users.AddAsync(adminUser);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("First admin user created via setup: {Email}", adminUser.Email);

            return new SetupFirstAdminResponse
            {
                Message = "First admin created successfully.",
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
