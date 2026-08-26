using MediatR;
using RealEstate.Application.Chats.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Queries
{
    public record GetChatByIdQuery : IRequest<ChatDetailDto>
    {
        public Guid ChatId { get; init; }
    }

    public record ChatDetailDto
    {
        public Guid Id { get; init; }
        public Guid BuyerId { get; init; }
        public Guid SellerId { get; init; }
        public ChatPropertyDto? Property { get; init; }
        public List<ChatMessageDto> Messages { get; init; } = [];
    }






    public class GetChatByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<GetChatByIdQuery, ChatDetailDto>
    {
        public async Task<ChatDetailDto> Handle(
            GetChatByIdQuery request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var chat = await context.Chats
                .FirstOrDefaultAsync(c => c.Id == request.ChatId, cancellationToken);

            if (chat is null)
                throw new NotFoundException(nameof(Chat), request.ChatId);

            if (chat.BuyerId != currentUser.UserId && chat.SellerId != currentUser.UserId)
                throw new ForbiddenAccessException("Not authorized to view these messages");

            var result = await context.Chats
                .Where(c => c.Id == request.ChatId)
                .Select(c => new ChatDetailDto
                {
                    Id = c.Id,
                    BuyerId = c.BuyerId,
                    SellerId = c.SellerId,
                    Property = c.Property == null ? null : new ChatPropertyDto
                    {
                        Id = c.Property.Id,
                        Title = c.Property.Title,
                        Price = c.Property.Price
                    },
                    Messages = c.Messages
                        .OrderBy(m => m.CreatedAt)
                        .Select(m => new ChatMessageDto
                        {
                            Id = m.Id,
                            ChatId = m.ChatId,
                            SenderId = m.SenderId,
                            Text = m.Text,
                            Image = m.Image,
                            CreatedAt = m.CreatedAt,
                            Sender = new SenderDto
                            {
                                Id = m.Sender.Id,
                                Name = m.Sender.Name,
                                ProfilePic = m.Sender.ProfilePic
                            }
                        })
                        .ToList()
                })
                .FirstAsync(cancellationToken);

            return result;
        }
    }
}
