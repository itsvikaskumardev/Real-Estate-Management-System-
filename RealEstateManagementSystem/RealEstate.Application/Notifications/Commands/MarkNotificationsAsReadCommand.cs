using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Notifications.Commands
{
    // If NotificationId is null, mark all as read.
    public record MarkNotificationsAsReadCommand(Guid? NotificationId = null) : IRequest;

    public class MarkNotificationsAsReadCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<MarkNotificationsAsReadCommand>
    {
        public async Task Handle(MarkNotificationsAsReadCommand request, CancellationToken ct)
        {
            if (currentUserService.UserId == null)
                return;

            var userId = currentUserService.UserId.Value;

            var query = dbContext.Notifications.Where(n => n.UserId == userId && !n.IsRead);

            if (request.NotificationId.HasValue)
            {
                query = query.Where(n => n.Id == request.NotificationId.Value);
            }

            var unreadNotifications = await query.ToListAsync(ct);

            foreach (var n in unreadNotifications)
            {
                n.IsRead = true;
            }

            if (unreadNotifications.Any())
            {
                await dbContext.SaveChangesAsync(ct);
            }
        }
    }
}
