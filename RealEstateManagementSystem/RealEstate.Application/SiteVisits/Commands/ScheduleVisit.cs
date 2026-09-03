using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.SiteVisits.Commands
{
    public record ScheduleVisitCommand : IRequest<bool>
    {
        public Guid PropertyId { get; init; }
        public DateTime VisitDate { get; init; }
        public string? Message { get; init; }
    }

    public class ScheduleVisitCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<ScheduleVisitCommand, bool>
    {
        public async Task<bool> Handle(ScheduleVisitCommand request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return false;

            var buyerId = currentUserService.UserId.Value;

            var property = await dbContext.Properties
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, ct);

            if (property == null || !property.IsActive || !property.IsVerified)
                return false; // Cannot visit an unverified/inactive property

            // Check if there is already a pending visit for this buyer & property
            var existingVisit = await dbContext.SiteVisits
                .AnyAsync(sv => sv.PropertyId == request.PropertyId && sv.BuyerId == buyerId && sv.Status == "Pending", ct);

            if (existingVisit)
                return false;

            var siteVisit = new SiteVisit
            {
                PropertyId = property.Id,
                BuyerId = buyerId,
                SellerId = property.SellerId,
                VisitDate = request.VisitDate,
                Message = request.Message,
                Status = "Pending"
            };

            await dbContext.SiteVisits.AddAsync(siteVisit);
            await dbContext.SaveChangesAsync(ct);

            return true;
        }
    }
}
