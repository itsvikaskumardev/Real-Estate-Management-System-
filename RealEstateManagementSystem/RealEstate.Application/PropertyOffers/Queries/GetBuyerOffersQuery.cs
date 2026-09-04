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
    public class OfferDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public string PropertyImageUrl { get; set; } = string.Empty;
        public decimal PropertyPrice { get; set; }
        public decimal OfferAmount { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string BuyerEmail { get; set; } = string.Empty;
    }

    public record GetBuyerOffersQuery : IRequest<List<OfferDto>>;

    public class GetBuyerOffersQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetBuyerOffersQuery, List<OfferDto>>
    {
        public async Task<List<OfferDto>> Handle(GetBuyerOffersQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId == null)
                throw new UnauthorizedException("Only buyers can view their offers.");

            var buyerId = currentUserService.UserId.Value;

            return await dbContext.PropertyOffers
                .Include(o => o.Property)
                .ThenInclude(p => p.Images)
                .Include(o => o.Buyer)
                .Where(o => o.BuyerId == buyerId && !o.IsDeleted)
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
