using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Properties.Queries
{
    public class GetPropertiesQuery : IRequest<List<Property>>
    {
        public string? City { get; set; }
    }

    public class GetPropertiesQueryHandler(IApplicationDbContext context) : IRequestHandler<GetPropertiesQuery, List<Property>>
    {
        public async Task<List<Property>> Handle(GetPropertiesQuery request, CancellationToken cancellationToken)
        {
            var query = context.Properties
                .Include(p => p.Images)
                .Include(p => p.Seller)
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.City))
            {
                query = query.Where(p => p.Address.City.ToLower().Contains(request.City.ToLower()));
            }

            return await query.ToListAsync(cancellationToken);
        }
    }
}
