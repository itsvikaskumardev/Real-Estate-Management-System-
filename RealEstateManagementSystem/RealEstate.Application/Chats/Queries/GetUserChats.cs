using MediatR;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Chats.Commands;
using RealEstate.Application.Chats.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace RealEstate.Application.Chats.Queries
{
    public record GetUserChatsQuery : IRequest<List<ChatDto>>;






    public class GetUserChatsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<GetUserChatsQuery, List<ChatDto>>
    {
        public async Task<List<ChatDto>> Handle(
            GetUserChatsQuery request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var userId = currentUser.UserId.Value;

            var chats = await context.Chats
                .Where(c => c.BuyerId == userId || c.SellerId == userId)
                .OrderByDescending(c => c.ModifiedAt ?? c.CreatedAt)
                .Select(c => new ChatDto
                {
                    Id = c.Id,
                    UpdatedAt = c.ModifiedAt ?? c.CreatedAt,
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
                .ToListAsync(cancellationToken);

            return chats;
        }
    }
}
