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

    public record GetPublicProfileResponse
    {
        public string Name { get; init; } = string.Empty;
        public string? ProfilePic { get; init; }
        public string Role { get; init; } = string.Empty;
        public DateTimeOffset CreatedAt { get; init; }
    }

    public class GetPublicProfileQueryHandler(IApplicationDbContext context)
        : IRequestHandler<GetPublicProfileQuery, GetPublicProfileResponse>
    {
        public async Task<GetPublicProfileResponse> Handle(
            GetPublicProfileQuery request,
            CancellationToken cancellationToken)
        {
            var user = await context.Users
                .Where(u => u.Id == request.UserId)
                .Select(u => new GetPublicProfileResponse
                {
                    Name = u.Name,
                    ProfilePic = u.ProfilePic,
                    Role = u.Role.ToString(),
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (user is null)
                throw new NotFoundException(nameof(User), request.UserId);

            return user;
        }
    }
}
