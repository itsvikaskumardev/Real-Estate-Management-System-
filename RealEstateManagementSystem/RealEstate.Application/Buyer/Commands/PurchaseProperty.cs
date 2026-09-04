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
    public record PurchasePropertyCommand(Guid PropertyId) : IRequest<Guid?>;

    public class PurchasePropertyCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<PurchasePropertyCommand, Guid?>
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

            // Calculate 2% admin commission and 98% seller revenue
            var adminCommission = property.Price * 0.02m;
            var sellerRevenue = property.Price - adminCommission;

            var transaction = new Transaction
            {
                PropertyId = property.Id,
                BuyerId = buyerId,
                SellerId = property.SellerId,
                Price = property.Price,
                AdminCommission = adminCommission,
                SellerRevenue = sellerRevenue,
                Status = "Completed"
            };

            property.Status = PropertyStatus.Sold;

            await dbContext.Transactions.AddAsync(transaction, ct);
            await dbContext.SaveChangesAsync(ct);

            return transaction.Id;
        }
    }
}
