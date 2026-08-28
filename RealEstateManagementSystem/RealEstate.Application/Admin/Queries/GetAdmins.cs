using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Auth.Dto;
using RealEstate.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Admin.Queries
{
    public record GetAdminsQuery : IRequest<GetAdminsResponse>;

    public record GetAdminsResponse
    {
        public int Count { get; init; }
        public List<UserDto> Admins { get; init; } = new();
    }

    public class GetAdminsQueryHandler(IApplicationDbContext context) 
        : IRequestHandler<GetAdminsQuery, GetAdminsResponse>
    {
        public async Task<GetAdminsResponse> Handle(GetAdminsQuery request, CancellationToken cancellationToken)
        {
            var users = await context.Users.ToListAsync(cancellationToken);
            
            var admins = users
                .Where(u => u.Role == UserRole.Admin)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role.ToString().ToLower(),
                    Phone = u.Phone,
                    Address = u.Address,
                    ProfilePic = u.ProfilePic,
                    IsApproved = u.IsApproved
                })
                .ToList();

            return new GetAdminsResponse
            {
                Count = admins.Count,
                Admins = admins
            };
        }
    }
}
