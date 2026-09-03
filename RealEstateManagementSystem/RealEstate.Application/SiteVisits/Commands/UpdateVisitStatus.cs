using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.SiteVisits.Commands
{
    public record UpdateVisitStatusCommand : IRequest<bool>
    {
        public Guid VisitId { get; init; }
        public string Status { get; init; } = null!; // "Approved", "Rejected", "Completed"
    }

    public class UpdateVisitStatusCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        IGlobalNotificationService globalNotificationService) : IRequestHandler<UpdateVisitStatusCommand, bool>
    {
        public async Task<bool> Handle(UpdateVisitStatusCommand request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return false;

            var userId = currentUserService.UserId.Value;

            var siteVisit = await dbContext.SiteVisits
                .Include(sv => sv.Property)
                .Include(sv => sv.Seller)
                .FirstOrDefaultAsync(sv => sv.Id == request.VisitId, ct);

            if (siteVisit == null)
                return false;

            // Only the Seller can approve/reject, but Buyer might cancel? 
            // We'll just enforce that userId must be SellerId to approve/reject.
            if (siteVisit.SellerId != userId)
                return false;

            // Validate status
            if (request.Status != "Approved" && request.Status != "Rejected" && request.Status != "Completed")
                return false;

            siteVisit.Status = request.Status;
            // Entity is already tracked by EF Core

            await dbContext.SaveChangesAsync(ct);

            // Notify the buyer
            string message = request.Status switch
            {
                "Approved" => $"Your site visit for {siteVisit.Property.Title} has been approved!",
                "Rejected" => $"Your site visit for {siteVisit.Property.Title} has been rejected.",
                "Completed" => $"Your site visit for {siteVisit.Property.Title} is completed.",
                _ => $"Your site visit status changed to {request.Status}"
            };

            string type = request.Status == "Approved" ? "success" : (request.Status == "Rejected" ? "error" : "info");

            await globalNotificationService.SendNotificationAsync(
                siteVisit.BuyerId,
                "Site Visit Update",
                message,
                type
            );

            return true;
        }
    }
}
