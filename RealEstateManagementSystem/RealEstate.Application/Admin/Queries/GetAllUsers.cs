using MediatR;
using RealEstate.Application.Common.Interfaces;
using System;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text;
using RealEstate.Application.Admin.Dto;

namespace RealEstate.Application.Admin.Queries
{
    public record GetAllUsersQuery : IRequest<GetAllUsersResponse>;

    public record GetAllUsersResponse
    {
        public int Count { get; init; }
        public List<UserListItemDto> Users { get; init; } = [];
    }



    public class GetAllUsersQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<GetAllUsersQuery, GetAllUsersResponse>
    {
        public async Task<GetAllUsersResponse> Handle(
            GetAllUsersQuery request,
            CancellationToken ct)
        {
            var users = await dbContext.Users
                .Where(u => u.IsActive && !u.IsDeleted)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    Phone = u.Phone,
                    IsBlocked = u.IsBlocked,
                    IsApproved = u.IsApproved,
                    IsVerified = u.IsVerified,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync(ct);

            return new GetAllUsersResponse
            {
                Count = users.Count,
                Users = users
            };
        }
    }
}
