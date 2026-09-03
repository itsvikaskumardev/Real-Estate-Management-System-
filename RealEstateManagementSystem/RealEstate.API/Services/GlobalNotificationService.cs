using Microsoft.AspNetCore.SignalR;
using RealEstate.API.Hubs;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Threading.Tasks;

namespace RealEstate.API.Services
{
    public class GlobalNotificationService : IGlobalNotificationService
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public GlobalNotificationService(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(Guid userId, string title, string message, string type = "info")
        {
            var notification = new NotificationDto
            {
                Title = title,
                Message = message,
                Type = type,
                CreatedAt = DateTime.UtcNow
            };

            await _hubContext.Clients.Group($"User_{userId.ToString().ToLowerInvariant()}").SendAsync("ReceiveNotification", notification);
        }
    }
}
