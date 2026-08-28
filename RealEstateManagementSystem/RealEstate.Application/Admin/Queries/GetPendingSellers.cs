using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Queries
{
    public record GetPendingSellersQuery : IRequest<GetPendingSellersResponse>;

    public record GetPendingSellersResponse
    {
        public int Count { get; init; }
        public List<PendingSellerDto> PendingSellers { get; init; } = [];
    }



    public class GetPendingSellersQueryHandler(IApplicationDbContext context)
        : IRequestHandler<GetPendingSellersQuery, GetPendingSellersResponse>
    {
        public async Task<GetPendingSellersResponse> Handle(
            GetPendingSellersQuery request,
            CancellationToken cancellationToken)
        {
            var pendingSellers = await context.Users
                .Where(u => u.Role == UserRole.Seller && !u.IsApproved && u.IsActive && !u.IsDeleted)
                .Select(u => new PendingSellerDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return new GetPendingSellersResponse
            {
                Count = pendingSellers.Count,
                PendingSellers = pendingSellers
            };
        }
    }
}
