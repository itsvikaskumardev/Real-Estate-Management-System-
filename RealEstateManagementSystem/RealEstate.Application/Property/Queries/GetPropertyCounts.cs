using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Property.Queries
{

    public record GetPropertyCountsQuery : IRequest<Dictionary<string, int>>;

    public class GetPropertyCountsQueryHandler(IApplicationDbContext context)
        : IRequestHandler<GetPropertyCountsQuery, Dictionary<string, int>>
    {
        public async Task<Dictionary<string, int>> Handle(
            GetPropertyCountsQuery request,
            CancellationToken cancellationToken)
        {
            var counts = await context.Properties
                .Where(p => p.Status == PropertyStatus.Sale)
                .GroupBy(p => p.PropertyType)
                .Select(g => new { PropertyType = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            return counts.ToDictionary(
                x => x.PropertyType.ToString(),
                x => x.Count);
        }
    }
}
