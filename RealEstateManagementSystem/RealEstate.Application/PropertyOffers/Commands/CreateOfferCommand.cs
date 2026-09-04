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
    public record CreateOfferCommand(Guid PropertyId, decimal OfferAmount, string Message) : IRequest<Guid>;

    public class CreateOfferCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<CreateOfferCommand, Guid>
    {
        public async Task<Guid> Handle(CreateOfferCommand request, CancellationToken ct)
        {
            if (currentUserService.UserId == null)
                throw new UnauthorizedException("Only buyers can make offers.");

            var buyerId = currentUserService.UserId.Value;

            var property = await dbContext.Properties.FindAsync([request.PropertyId], ct)
                ?? throw new NotFoundException(nameof(Property), request.PropertyId);

            // ENFORCE: 1 offer per buyer per property limit
            var existingOffer = await dbContext.PropertyOffers
                .FirstOrDefaultAsync(o => o.PropertyId == request.PropertyId && o.BuyerId == buyerId, ct);

            if (existingOffer != null)
                throw new InvalidOperationException("You have already made an offer on this property. Only one offer is allowed.");

            var offer = new PropertyOffer
            {
                PropertyId = request.PropertyId,
                BuyerId = buyerId,
                SellerId = property.SellerId,
                OfferAmount = request.OfferAmount,
                Message = request.Message,
                Status = "Pending"
            };

            await dbContext.PropertyOffers.AddAsync(offer, ct);
            await dbContext.SaveChangesAsync(ct);

            return offer.Id;
        }
    }
}
