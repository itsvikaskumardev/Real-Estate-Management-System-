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
    public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;



    public class GetDashboardStatsQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
    {
        public async Task<DashboardStatsDto> Handle(
       GetDashboardStatsQuery request,
       CancellationToken ct)
        {
            var totalUsers = await dbContext.Users.CountAsync(u => u.IsActive && !u.IsDeleted, ct);

            var propertyStats = await dbContext.Properties
                .Where(p => p.IsActive && !p.IsDeleted)
                .GroupBy(p => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    Active = g.Count(p => p.Status == PropertyStatus.Sale),
                    Sold = g.Count(p => p.Status == PropertyStatus.Sold)
                })
                .FirstOrDefaultAsync(ct);

            return new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                TotalProperties = propertyStats?.Total ?? 0,
                ActiveListings = propertyStats?.Active ?? 0,
                SoldProperties = propertyStats?.Sold ?? 0
            };
        }
    }
}
