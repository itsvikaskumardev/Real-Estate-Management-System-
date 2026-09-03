using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Analytics.Queries
{
    public class SellerAnalyticsDto
    {
        public int TotalProperties { get; set; }
        public int TotalLeads { get; set; }
        public int TotalSales { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<MonthlySalesDto> MonthlySales { get; set; } = new();
        public List<PropertyTypeStatsDto> PropertyTypeStats { get; set; } = new();
    }

    public class MonthlySalesDto
    {
        public string Month { get; set; } = null!;
        public decimal Revenue { get; set; }
        public int SalesCount { get; set; }
    }

    public class PropertyTypeStatsDto
    {
        public string Name { get; set; } = null!;
        public int Value { get; set; }
    }

    public record GetSellerAnalyticsQuery : IRequest<SellerAnalyticsDto>;

    public class GetSellerAnalyticsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetSellerAnalyticsQuery, SellerAnalyticsDto>
    {
        public async Task<SellerAnalyticsDto> Handle(GetSellerAnalyticsQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return new SellerAnalyticsDto();

            var sellerId = currentUserService.UserId.Value;

            var properties = await dbContext.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted)
                .ToListAsync(ct);

            var propertyIds = properties.Select(p => p.Id).ToList();

            var inquiriesCount = await dbContext.Inquiries
                .Where(i => propertyIds.Contains(i.PropertyId))
                .CountAsync(ct);

            var siteVisitsCount = await dbContext.SiteVisits
                .Where(sv => sv.SellerId == sellerId)
                .CountAsync(ct);

            var sales = await dbContext.Transactions
                .Include(t => t.Property)
                .Where(t => t.SellerId == sellerId && t.Status == "Completed")
                .ToListAsync(ct);

            var analytics = new SellerAnalyticsDto
            {
                TotalProperties = properties.Count,
                TotalLeads = inquiriesCount + siteVisitsCount,
                TotalSales = sales.Count,
                TotalRevenue = sales.Sum(s => s.Price)
            };

            // Calculate Monthly Sales (Last 6 months)
            var last6Months = Enumerable.Range(0, 6)
                .Select(i => DateTime.UtcNow.AddMonths(-i))
                .OrderBy(d => d)
                .ToList();

            foreach (var month in last6Months)
            {
                var monthSales = sales.Where(s => s.CreatedAt.Year == month.Year && s.CreatedAt.Month == month.Month).ToList();
                analytics.MonthlySales.Add(new MonthlySalesDto
                {
                    Month = month.ToString("MMM"),
                    Revenue = monthSales.Sum(s => s.Price),
                    SalesCount = monthSales.Count
                });
            }

            // Calculate Property Type Stats
            var typeStats = properties.GroupBy(p => p.PropertyType)
                .Select(g => new PropertyTypeStatsDto
                {
                    Name = g.Key.ToString(),
                    Value = g.Count()
                }).ToList();
            
            analytics.PropertyTypeStats = typeStats;

            return analytics;
        }
    }
}
