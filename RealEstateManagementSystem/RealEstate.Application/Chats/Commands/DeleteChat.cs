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
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
        : IRequestHandler<DeleteChatCommand, DeleteChatResponse>
    {
        public async Task<DeleteChatResponse> Handle(
            DeleteChatCommand request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var chat = await dbContext.Chats
                .FirstOrDefaultAsync(c => c.Id == request.ChatId && c.IsActive && !c.IsDeleted, ct);

            if (chat is null)
                throw new NotFoundException(nameof(Chat), request.ChatId);

            if (chat.BuyerId != currentUser.UserId && chat.SellerId != currentUser.UserId)
                throw new ForbiddenAccessException("Not authorized");

            chat.IsDeleted = true;
            chat.IsActive = false;
            await dbContext.SaveChangesAsync(ct);

            return new DeleteChatResponse
            {
                Message = "Chat deleted successfully"
            };
        }
    }
}
