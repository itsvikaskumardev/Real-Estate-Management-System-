using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.PropertyOffers.Queries
{
    public record GetSellerOffersQuery : IRequest<List<OfferDto>>;

    public class GetSellerOffersQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetSellerOffersQuery, List<OfferDto>>
    {
        public async Task<List<OfferDto>> Handle(GetSellerOffersQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId == null)
                throw new UnauthorizedException("Only sellers can view their offers.");

            var sellerId = currentUserService.UserId.Value;

            return await dbContext.PropertyOffers
                .Include(o => o.Property)
                .ThenInclude(p => p.Images)
                .Include(o => o.Buyer)
                .Where(o => o.SellerId == sellerId && !o.IsDeleted)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OfferDto
                {
                    Id = o.Id,
                    PropertyId = o.PropertyId,
                    PropertyTitle = o.Property.Title,
                    PropertyImageUrl = o.Property.Images.OrderBy(i => i.SortOrder).FirstOrDefault() != null 
                        ? o.Property.Images.OrderBy(i => i.SortOrder).FirstOrDefault()!.Url 
                        : "",
                    PropertyPrice = o.Property.Price,
                    OfferAmount = o.OfferAmount,
                    Message = o.Message,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    BuyerName = o.Buyer.Name,
                    BuyerEmail = o.Buyer.Email
                })
                .ToListAsync(ct);
        }
    }
}
