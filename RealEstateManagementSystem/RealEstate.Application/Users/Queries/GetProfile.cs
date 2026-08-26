using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Users.Queries
{
    public record GetProfileQuery : IRequest<GetProfileResponse>;

    public record GetProfileResponse
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
        public string? Phone { get; init; }
        public string? ProfilePic { get; init; }
        public string? Address { get; init; }
        public bool IsBlocked { get; init; }
        public bool IsApproved { get; init; }
        public bool IsVerified { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
    }

    public class GetProfileQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<GetProfileQuery, GetProfileResponse>
    {
        public async Task<GetProfileResponse> Handle(
            GetProfileQuery request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var user = await context.Users
                .Where(u => u.Id == currentUser.UserId)
                .Select(u => new GetProfileResponse
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    Phone = u.Phone,
                    ProfilePic = u.ProfilePic,
                    Address = u.Address,
                    IsBlocked = u.IsBlocked,
                    IsApproved = u.IsApproved,
                    IsVerified = u.IsVerified,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync(ct);

            if (user is null)
                throw new NotFoundException(nameof(User), currentUser.UserId);

            return user;
        }
    }
}
