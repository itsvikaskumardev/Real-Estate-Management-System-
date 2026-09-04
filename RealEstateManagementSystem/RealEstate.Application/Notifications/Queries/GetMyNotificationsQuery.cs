using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Notifications.Queries
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? RelatedEntityId { get; set; }
    }

    public record GetMyNotificationsQuery : IRequest<List<NotificationDto>>;

    public class GetMyNotificationsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetMyNotificationsQuery, List<NotificationDto>>
    {
        public async Task<List<NotificationDto>> Handle(GetMyNotificationsQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId == null)
                return new List<NotificationDto>();

            var userId = currentUserService.UserId.Value;

            return await dbContext.Notifications
                .Where(n => n.UserId == userId && !n.IsDeleted)
                .OrderBy(n => n.IsRead)
                .ThenByDescending(n => n.CreatedAt)
                .Take(20)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt,
                    RelatedEntityId = n.RelatedEntityId
                })
                .ToListAsync(ct);
        }
    }
}
