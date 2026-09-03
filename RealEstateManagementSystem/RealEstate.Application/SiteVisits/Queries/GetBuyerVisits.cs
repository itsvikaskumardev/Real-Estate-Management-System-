using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.SiteVisits.Queries
{
    public class SiteVisitDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyTitle { get; set; } = null!;
        public string PropertyImage { get; set; } = null!;
        public Guid BuyerId { get; set; }
        public string BuyerName { get; set; } = null!;
        public string BuyerEmail { get; set; } = null!;
        public Guid SellerId { get; set; }
        public string SellerName { get; set; } = null!;
        public string SellerEmail { get; set; } = null!;
        public DateTime VisitDate { get; set; }
        public string Status { get; set; } = null!;
        public string? Message { get; set; }
    }

    public record GetBuyerVisitsQuery : IRequest<List<SiteVisitDto>>;

    public class GetBuyerVisitsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetBuyerVisitsQuery, List<SiteVisitDto>>
    {
        public async Task<List<SiteVisitDto>> Handle(GetBuyerVisitsQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return [];

            var buyerId = currentUserService.UserId.Value;

            return await dbContext.SiteVisits
                .Include(sv => sv.Property).ThenInclude(p => p.Images)
                .Include(sv => sv.Seller)
                .Where(sv => sv.BuyerId == buyerId)
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
