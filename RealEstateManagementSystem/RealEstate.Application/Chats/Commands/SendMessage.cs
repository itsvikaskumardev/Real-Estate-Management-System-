using MediatR;
using RealEstate.Application.Chats.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Commands
{
    public record SendMessageCommand : IRequest<SendMessageResponse>
    {
        public Guid ChatId { get; init; }
        public string Text { get; init; } = string.Empty;
        public string? Image { get; init; }
    }

    public record SendMessageResponse
    {
        public ChatMessageDto NewMessage { get; init; } = null!;
    }



    public class SendMessageCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IChatNotificationService chatNotificationService)
        : IRequestHandler<SendMessageCommand, SendMessageResponse>
    {
        public async Task<SendMessageResponse> Handle(
            SendMessageCommand request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var chat = await context.Chats
                .FirstOrDefaultAsync(c => c.Id == request.ChatId, cancellationToken);

            if (chat is null)
                throw new NotFoundException(nameof(Chat), request.ChatId);

            if (chat.BuyerId != currentUser.UserId && chat.SellerId != currentUser.UserId)
                throw new ForbiddenAccessException("Not authorized to send messages in this chat");

            var message = new Domain.Entities.ChatMessage
            {
                ChatId = chat.Id,
                SenderId = currentUser.UserId.Value,
                Text = request.Text,
                Image = request.Image,
                CreatedAt = DateTimeOffset.UtcNow
            };

            context.ChatMessages.Add(message);
            await context.SaveChangesAsync(cancellationToken);

            var response = new SendMessageResponse
            {
                NewMessage = new ChatMessageDto
                {
                    Id = message.Id,
                    ChatId = message.ChatId,
                    SenderId = message.SenderId,
                    Text = message.Text,
                    Image = message.Image,
                    CreatedAt = message.CreatedAt
                }
            };

            await chatNotificationService.BroadcastMessageAsync(chat.Id, response.NewMessage);

            return response;
        }
    }
}
