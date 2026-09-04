using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Property.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Property.Queries
{
    public record GetPropertyReviewsQuery(Guid PropertyId) : IRequest<List<ReviewDto>>;

    public class GetPropertyReviewsQueryHandler(IApplicationDbContext dbContext) : IRequestHandler<GetPropertyReviewsQuery, List<ReviewDto>>
    {
        public async Task<List<ReviewDto>> Handle(GetPropertyReviewsQuery request, CancellationToken ct)
        {
            var reviews = await dbContext.Reviews
                .Where(r => r.PropertyId == request.PropertyId)
                .Include(r => r.Buyer)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    PropertyId = r.PropertyId,
                    BuyerId = r.BuyerId,
                    BuyerName = r.Buyer.Name,
                    BuyerProfilePic = r.Buyer.ProfilePic,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync(ct);

            return reviews;
        }
    }
}
