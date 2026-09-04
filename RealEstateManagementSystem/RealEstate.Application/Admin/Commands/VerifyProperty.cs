using MediatR;
using RealEstate.Application.Common.Interfaces;
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
            string message = request.Approve 
                ? $"Your property '{property.Title}' has been approved/verified by the admin."
                : $"Your property '{property.Title}' verification was rejected by the admin.";
            
            string type = request.Approve ? "success" : "error";

            await globalNotificationService.SendNotificationAsync(
                property.SellerId,
                "Property Verification Update",
                message,
                type
            );

            await globalNotificationService.SendPropertyStatusUpdateAsync(
                property.SellerId,
                property.Id,
                property.IsVerified
            );

            return true;
        }
    }
}
