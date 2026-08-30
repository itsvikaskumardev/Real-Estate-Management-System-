using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using Microsoft.EntityFrameworkCore;

using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Users.Queries
{
    public record GetPublicProfileQuery : IRequest<GetPublicProfileResponse>
    {
        public Guid UserId { get; init; }
    }

    /*
     
     GetPublicProfileQuery or GetPublicProfileResponse), you are just defining a concept. No actual data exists yet.
     
     */

    public record GetPublicProfileResponse
    {
        public string Name { get; init; } = string.Empty;
        public string? ProfilePic { get; init; }
        public string Role { get; init; } = string.Empty;
        public DateTimeOffset CreatedAt { get; init; }
    }

    public class GetPublicProfileQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<GetPublicProfileQuery, GetPublicProfileResponse>
    {
        public async Task<GetPublicProfileResponse> Handle(
            GetPublicProfileQuery request,
            CancellationToken ct)
        {
            var user = await dbContext.Users
                .Where(u => u.Id == request.UserId && u.IsActive && !u.IsDeleted)
                .Select(u => new GetPublicProfileResponse
                {
                    Name = u.Name,
                    ProfilePic = u.ProfilePic,
                    Role = u.Role.ToString(),
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync(ct);

            if (user is null)
                throw new NotFoundException(nameof(User), request.UserId);

            return user;
        }
    }
}
