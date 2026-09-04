using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.PropertyOffers.Commands
{
    public record UpdateOfferStatusCommand(Guid OfferId, string Status) : IRequest;

    public class UpdateOfferStatusCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService, IGlobalNotificationService notificationService) : IRequestHandler<UpdateOfferStatusCommand>
    {
        public async Task Handle(UpdateOfferStatusCommand request, CancellationToken ct)
        {
            if (currentUserService.UserId == null)
                throw new UnauthorizedException("Only authenticated sellers can update offers.");

            var sellerId = currentUserService.UserId.Value;

            var offer = await dbContext.PropertyOffers
                .Include(o => o.Property)
                .FirstOrDefaultAsync(o => o.Id == request.OfferId, ct)
                ?? throw new NotFoundException(nameof(PropertyOffer), request.OfferId);

            if (offer.SellerId != sellerId)
                throw new UnauthorizedException("You can only update offers on your own properties.");

            if (request.Status != "Accepted" && request.Status != "Rejected")
                throw new ArgumentException("Invalid status. Must be 'Accepted' or 'Rejected'.");

            offer.Status = request.Status;

            // Notify the buyer
            string title = request.Status == "Accepted" ? "Offer Accepted!" : "Offer Rejected";
            string msg = $"Your offer of ₹{offer.OfferAmount:N0} for {offer.Property.Title} was {request.Status.ToLower()}.";
            string type = request.Status == "Accepted" ? "success" : "error";
            
            // Create notification in DB
            var notification = new Notification
            {
                UserId = offer.BuyerId,
                Title = title,
                Message = msg,
                Type = type,
                RelatedEntityId = offer.PropertyId
            };
            
            await dbContext.Notifications.AddAsync(notification, ct);
            await dbContext.SaveChangesAsync(ct);

            // Send Real-time notification
            await notificationService.SendNotificationAsync(offer.BuyerId, title, msg, type);
        }
    }
}
