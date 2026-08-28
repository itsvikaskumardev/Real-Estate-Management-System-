using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Wishlist.Commands
{
    public record RemoveFromWishlistCommand : IRequest<RemoveFromWishlistResponse>
    {
        public Guid PropertyId { get; init; }
    }

    public record RemoveFromWishlistResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public class RemoveFromWishlistCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
        : IRequestHandler<RemoveFromWishlistCommand, RemoveFromWishlistResponse>
    {
        public async Task<RemoveFromWishlistResponse> Handle(
            RemoveFromWishlistCommand request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var item = await dbContext.Wishlists
                .FirstOrDefaultAsync(w =>
                    w.UserId == currentUser.UserId &&
                    w.PropertyId == request.PropertyId,
                    ct);

            if (item is null)
                throw new NotFoundException("Wishlist item", request.PropertyId);

            dbContext.Wishlists.Remove(item);
            await dbContext.SaveChangesAsync(ct);

            return new RemoveFromWishlistResponse
            {
                Success = true,
                Message = "Removed from wishlist"
            };
        }
    }
}
