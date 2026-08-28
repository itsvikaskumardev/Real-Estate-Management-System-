using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Property.Queries
{
    public record GetSellerDashboardQuery : IRequest<SellerDashboardStatsDto>;

    public record SellerDashboardStatsDto
    {
        public int TotalProperties { get; init; }
        public int ActiveListings { get; init; }
        public int SoldProperties { get; init; }
        public int TotalInquiries { get; init; }
        public int TotalViews { get; init; }
    }

    public class GetSellerDashboardQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<GetSellerDashboardQuery, SellerDashboardStatsDto>
    {
        public async Task<SellerDashboardStatsDto> Handle(
            GetSellerDashboardQuery request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var sellerId = currentUser.UserId.Value;

            var propertyStats = await context.Properties
                .Where(p => p.SellerId == sellerId)
                .GroupBy(p => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    Active = g.Count(p => p.Status == PropertyStatus.Sale),
                    Sold = g.Count(p => p.Status == PropertyStatus.Sold),
                    TotalViews = g.Sum(p => p.Views)
                })
                .FirstOrDefaultAsync(cancellationToken);

            var totalInquiries = await context.Inquiries
                .CountAsync(i => i.SellerId == sellerId, cancellationToken);

            return new SellerDashboardStatsDto
            {
                TotalProperties = propertyStats?.Total ?? 0,
                ActiveListings = propertyStats?.Active ?? 0,
                SoldProperties = propertyStats?.Sold ?? 0,
                TotalInquiries = totalInquiries,
                TotalViews = propertyStats?.TotalViews ?? 0
            };
        }
    }
}
