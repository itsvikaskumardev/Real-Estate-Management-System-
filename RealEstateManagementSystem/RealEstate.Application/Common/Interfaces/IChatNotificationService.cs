using RealEstate.Application.Chats.Dto;
using System;
using System.Threading.Tasks;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IChatNotificationService
    {
        Task BroadcastMessageAsync(Guid chatId, ChatMessageDto message);
    }
}
