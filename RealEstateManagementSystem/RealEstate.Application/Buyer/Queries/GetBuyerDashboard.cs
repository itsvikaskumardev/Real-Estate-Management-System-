using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Buyer.Queries
{
    public record GetBuyerDashboardQuery : IRequest<BuyerDashboardDto>;

    public record BuyerDashboardDto
    {
        public int TotalPropertiesPurchased { get; init; }
        public decimal TotalAmountSpent { get; init; }
        public List<PurchasedPropertyDto> PurchasedProperties { get; init; } = [];
    }

    public record PurchasedPropertyDto
    {
        public Guid TransactionId { get; init; }
        public Guid PropertyId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Location { get; init; } = string.Empty;
        public decimal OriginalPrice { get; init; }
        public decimal? OfferPrice { get; init; }
        public string? ImageUrl { get; init; }
        public string Status { get; init; } = string.Empty;
        public DateTime TransactionDate { get; init; }
    }

    public class GetBuyerDashboardQueryHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
        : IRequestHandler<GetBuyerDashboardQuery, BuyerDashboardDto>
    {
        public async Task<BuyerDashboardDto> Handle(
            GetBuyerDashboardQuery request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var buyerId = currentUser.UserId.Value;

            // Note: If Transaction does not have CreatedAt, we might need a migration.
            // But if it's updated to BaseAuditableEntity, this will work.
            var transactions = await dbContext.Transactions
                .Include(t => t.Property)
                .ThenInclude(p => p.Address)
                .Include(t => t.Property)
                .ThenInclude(p => p.Images)
                .Where(t => t.BuyerId == buyerId && t.Status == "Completed" && t.IsActive && !t.IsDeleted)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync(ct);

            var totalPurchased = transactions.Count;
            var totalSpent = transactions.Sum(t => t.Price);

            // Fetch any accepted offers for these properties to determine if an offer was used
            var propertyIds = transactions.Select(t => t.PropertyId).ToList();
            var acceptedOffers = await dbContext.PropertyOffers
                .Where(o => o.BuyerId == buyerId && propertyIds.Contains(o.PropertyId) && o.Status == "Accepted")
                .ToListAsync(ct);

            var purchasedProperties = transactions.Select(t => {
                var offer = acceptedOffers.FirstOrDefault(o => o.PropertyId == t.PropertyId && o.OfferAmount == t.Price);
                
                return new PurchasedPropertyDto
                {
                    TransactionId = t.Id,
                    PropertyId = t.PropertyId,
                    Title = t.Property.Title,
                    Location = $"{t.Property.Address.Street}, {t.Property.Address.City}",
                    OriginalPrice = t.Property.Price,
                    OfferPrice = offer != null ? offer.OfferAmount : (t.Price != t.Property.Price ? t.Price : null),
                    ImageUrl = t.Property.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.Url,
                    Status = t.Status,
                    TransactionDate = t.CreatedAt
                };
            })
            // Sort by TransactionDate descending
            .OrderByDescending(p => p.TransactionDate)
            .ToList();

            return new BuyerDashboardDto
            {
                TotalPropertiesPurchased = totalPurchased,
                TotalAmountSpent = totalSpent,
                PurchasedProperties = purchasedProperties
            };
        }
    }
}
