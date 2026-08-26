using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Chats.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Commands
{
    public record StartOrGetChatCommand : IRequest<ChatDto>
    {
        public Guid? PropertyId { get; init; }
        public Guid? SellerId { get; init; }
        public Guid? BuyerId { get; init; }
    }







    public class StartOrGetChatCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<StartOrGetChatCommand, ChatDto>
    {
        public async Task<ChatDto> Handle(
            StartOrGetChatCommand request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var caller = await context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUser.UserId, cancellationToken);

            if (caller is null)
                throw new NotFoundException(nameof(User), currentUser.UserId);

            Guid buyerId;
            Guid sellerId;

            if (caller.Role == UserRole.Seller)
            {
                if (request.BuyerId is null)
                    throw new BadRequestException("Missing buyer or seller ID");

                buyerId = request.BuyerId.Value;
                sellerId = caller.Id;
            }
            else
            {
                if (request.SellerId is null)
                    throw new BadRequestException("Missing buyer or seller ID");

                buyerId = caller.Id;
                sellerId = request.SellerId.Value;
            }

            var chat = await context.Chats
                .FirstOrDefaultAsync(c =>
                    c.BuyerId == buyerId &&
                    c.SellerId == sellerId,
                    cancellationToken);

            if (chat is null)
            {
                chat = new Domain.Entities.Chat
                {
                    PropertyId = request.PropertyId,
                    BuyerId = buyerId,
                    SellerId = sellerId
                };

                context.Chats.Add(chat);
                await context.SaveChangesAsync(cancellationToken);
            }

            var result = await context.Chats
                .Where(c => c.Id == chat.Id)
                .Select(c => new ChatDto
                {
                    Id = c.Id,
                    Buyer = new BuyerDto
                    {
                        Id = c.Buyer.Id,
                        Name = c.Buyer.Name,
                        Email = c.Buyer.Email,
                        ProfilePic = c.Buyer.ProfilePic
                    },
                    Seller = new SellerDto
                    {
                        Id = c.Seller.Id,
                        Name = c.Seller.Name,
                        Email = c.Seller.Email,
                        ProfilePic = c.Seller.ProfilePic
                    },
                    Property = c.Property == null ? null : new ChatPropertyDto
                    {
                        Id = c.Property.Id,
                        Title = c.Property.Title,
                        Price = c.Property.Price,
                        Images = c.Property.Images.Select(i => i.Url).ToList()
                    }
                })
                .FirstAsync(cancellationToken);

            return result;
        }
    }
}
