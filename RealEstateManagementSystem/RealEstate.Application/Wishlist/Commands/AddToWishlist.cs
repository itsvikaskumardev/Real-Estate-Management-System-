using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Wishlist.Commands
{
    public record AddToWishlistCommand : IRequest<AddToWishlistResponse>
    {
        public Guid PropertyId { get; init; }
    }

    public record AddToWishlistResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public class AddToWishlistCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
        : IRequestHandler<AddToWishlistCommand, AddToWishlistResponse>
    {
        public async Task<AddToWishlistResponse> Handle(
    AddToWishlistCommand request,
    CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var propertyExists = await dbContext.Properties
                .AnyAsync(p => p.Id == request.PropertyId, ct);

            if (!propertyExists)
                throw new NotFoundException(nameof(Property), request.PropertyId);

            var existing = await dbContext.Wishlists
                .AnyAsync(w =>
                    w.UserId == currentUser.UserId &&
                    w.PropertyId == request.PropertyId,
                    ct);

            if (existing)
            {
                return new AddToWishlistResponse
                {
                    Success = true,
                    Message = "Already in wishlist"
                };
            }

            var wishlistItem = new Domain.Entities.Wishlist
            {
                UserId = currentUser.UserId.Value,
                PropertyId = request.PropertyId
            };

            dbContext.Wishlists.Add(wishlistItem);
            await dbContext.SaveChangesAsync(ct);

            return new AddToWishlistResponse
            {
                Success = true,
                Message = "Added to wishlist"
            };
        }
    }
}
