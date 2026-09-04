using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Admin.Commands
{
    public record VerifyPropertyCommand(Guid PropertyId, bool Approve) : IRequest<bool>;

    public class VerifyPropertyCommandHandler(
        IApplicationDbContext dbContext,
        IGlobalNotificationService globalNotificationService) : IRequestHandler<VerifyPropertyCommand, bool>
    {
        public async Task<bool> Handle(VerifyPropertyCommand request, CancellationToken ct)
        {
            var property = await dbContext.Properties.FindAsync([request.PropertyId], ct);
            if (property == null) return false;

            property.IsVerified = request.Approve;
            // If rejected, you might also want to set IsDeleted = true or Status = Rejected, depending on requirements.

            await dbContext.SaveChangesAsync(ct);

            // Notify the seller
            string title = request.Approve ? "Property Verified!" : "Property Rejected";
            string msg = request.Approve 
                ? $"Your property {property.Title} has been verified and is now live."
                : $"Your property {property.Title} has been rejected by the admin.";
            string type = request.Approve ? "success" : "error";

            // Save to DB
            var notif = new Notification
            {
                UserId = property.SellerId,
                Title = title,
                Message = msg,
                Type = type,
                RelatedEntityId = property.Id
            };
            await dbContext.Notifications.AddAsync(notif, ct);
            await dbContext.SaveChangesAsync(ct);

            // Real-time update
            await globalNotificationService.SendPropertyStatusUpdateAsync(property.SellerId, property.Id, request.Approve);
            await globalNotificationService.SendNotificationAsync(property.SellerId, title, msg, type);

            return true;
        }
    }
}
