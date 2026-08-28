using Microsoft.AspNetCore.SignalR;
using RealEstate.API.Hubs;
using RealEstate.Application.Chats.Dto;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Threading.Tasks;

namespace RealEstate.API.Services
{
    public class ChatNotificationService : IChatNotificationService
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatNotificationService(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task BroadcastMessageAsync(Guid chatId, ChatMessageDto message)
        {
            await _hubContext.Clients.Group(chatId.ToString()).SendAsync("receiveMessage", message);
        }
    }
}
