using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.SiteVisits.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.SiteVisits.Queries
{
    public record GetSellerVisitsQuery : IRequest<List<SiteVisitDto>>;

    public class GetSellerVisitsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetSellerVisitsQuery, List<SiteVisitDto>>
    {
        public async Task<List<SiteVisitDto>> Handle(GetSellerVisitsQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return [];

            var sellerId = currentUserService.UserId.Value;

            return await dbContext.SiteVisits
                .Include(sv => sv.Property).ThenInclude(p => p.Images)
                .Include(sv => sv.Buyer)
                .Where(sv => sv.SellerId == sellerId)
                .OrderByDescending(sv => sv.VisitDate)
                .Select(sv => new SiteVisitDto
                {
                    Id = sv.Id,
                    PropertyId = sv.PropertyId,
                    PropertyTitle = sv.Property.Title,
                    PropertyImage = sv.Property.Images.FirstOrDefault() != null ? sv.Property.Images.FirstOrDefault()!.Url : "",
                    BuyerId = sv.BuyerId,
                    BuyerName = sv.Buyer.Name,
                    BuyerEmail = sv.Buyer.Email,
                    SellerId = sv.SellerId,
                    SellerName = sv.Seller.Name,
                    SellerEmail = sv.Seller.Email,
                    VisitDate = sv.VisitDate,
                    Status = sv.Status,
                    Message = sv.Message
                })
                .ToListAsync(ct);
        }
    }
}
