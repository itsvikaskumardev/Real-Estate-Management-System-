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
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<RemoveFromWishlistCommand, RemoveFromWishlistResponse>
    {
        public async Task<RemoveFromWishlistResponse> Handle(
            RemoveFromWishlistCommand request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var item = await context.Wishlists
                .FirstOrDefaultAsync(w =>
                    w.UserId == currentUser.UserId &&
                    w.PropertyId == request.PropertyId,
                    cancellationToken);

            if (item is null)
                throw new NotFoundException("Wishlist item", request.PropertyId);

            context.Wishlists.Remove(item);
            await context.SaveChangesAsync(cancellationToken);

            return new RemoveFromWishlistResponse
            {
                Success = true,
                Message = "Removed from wishlist"
            };
        }
    }
}
