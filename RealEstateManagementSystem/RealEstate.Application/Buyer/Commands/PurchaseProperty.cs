using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Buyer.Commands
{
    public record PurchasePropertyCommand(Guid PropertyId, bool UseApprovedOfferPrice = false) : IRequest<Guid?>;

    public class PurchasePropertyCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService, IGlobalNotificationService notificationService) : IRequestHandler<PurchasePropertyCommand, Guid?>
    {
        public async Task<Guid?> Handle(PurchasePropertyCommand request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return null;

            var buyerId = currentUserService.UserId.Value;

            var property = await dbContext.Properties
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, ct);

            if (property == null || property.Status != PropertyStatus.Sale || !property.IsVerified)
                return null;

            decimal finalPrice = property.Price;

            if (request.UseApprovedOfferPrice)
            {
                var acceptedOffer = await dbContext.PropertyOffers
                    .FirstOrDefaultAsync(o => o.PropertyId == request.PropertyId && o.BuyerId == buyerId && o.Status == "Accepted", ct);

                if (acceptedOffer == null)
                    throw new InvalidOperationException("No accepted offer found for this property.");

                finalPrice = acceptedOffer.OfferAmount;
            }

            // Calculate 2% admin commission and 98% seller revenue
            var adminCommission = finalPrice * 0.02m;
            var sellerRevenue = finalPrice - adminCommission;

            var transaction = new Transaction
            {
                PropertyId = property.Id,
                BuyerId = buyerId,
                SellerId = property.SellerId,
                Price = finalPrice,
                AdminCommission = adminCommission,
                SellerRevenue = sellerRevenue,
                Status = "Completed"
            };

            property.Status = PropertyStatus.Sold;

            await dbContext.Transactions.AddAsync(transaction, ct);
            
            // Notify Seller
            var notif = new Notification
            {
                UserId = property.SellerId,
                Title = "Property Sold!",
                Message = $"Your property {property.Title} has been sold for ₹{finalPrice:N0}.",
                Type = "success",
                RelatedEntityId = property.Id
            };
            await dbContext.Notifications.AddAsync(notif, ct);

            await dbContext.SaveChangesAsync(ct);
            await notificationService.SendNotificationAsync(property.SellerId, notif.Title, notif.Message, notif.Type);

            return transaction.Id;
        }
    }
}
