using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Commands
{
    public record DeleteChatCommand : IRequest<DeleteChatResponse>
    {
        public Guid ChatId { get; init; }
    }

    public record DeleteChatResponse
    {
        public string Message { get; init; } = string.Empty;
    }

    public class DeleteChatCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<DeleteChatCommand, DeleteChatResponse>
    {
        public async Task<DeleteChatResponse> Handle(
            DeleteChatCommand request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var chat = await context.Chats
                .FirstOrDefaultAsync(c => c.Id == request.ChatId && c.IsActive && !c.IsDeleted, cancellationToken);

            if (chat is null)
                throw new NotFoundException(nameof(Chat), request.ChatId);

            if (chat.BuyerId != currentUser.UserId && chat.SellerId != currentUser.UserId)
                throw new ForbiddenAccessException("Not authorized");

            chat.IsDeleted = true;
            chat.IsActive = false;
            await context.SaveChangesAsync(cancellationToken);

            return new DeleteChatResponse
            {
                Message = "Chat deleted successfully"
            };
        }
    }
}
