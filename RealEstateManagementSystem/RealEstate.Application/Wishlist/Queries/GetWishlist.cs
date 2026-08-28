using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using RealEstate.Application.Property.Dto;


namespace RealEstate.Application.Wishlist.Queries
{
    public record GetWishlistQuery : IRequest<List<WishlistItemDto>>;

    public record WishlistItemDto
    {
        public Guid Id { get; init; }
        public PropertyDto Property { get; init; } = null!;
    }




    public class GetWishlistQueryHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
        : IRequestHandler<GetWishlistQuery, List<WishlistItemDto>>
    {
        public async Task<List<WishlistItemDto>> Handle(
            GetWishlistQuery request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var wishlist = await dbContext.Wishlists
                .Where(w => w.UserId == currentUser.UserId)
                .Select(w => new WishlistItemDto
                {
                    Id = w.Id,
                    Property = new PropertyDto
                    {
                        Id = w.Property.Id,
                        Title = w.Property.Title,
                        Description = w.Property.Description,
                        Price = w.Property.Price,
                        City = w.Property.Address.City,
                        Area = w.Property.Address.Street,
                        PropertyType = w.Property.PropertyType.ToString(),
                        Bhk = w.Property.Bhk,
                        Bathrooms = w.Property.Bathrooms,
                        AreaSize = w.Property.AreaSize,
                        Status = w.Property.Status.ToString(),
                        Images = w.Property.Images
                            .Select(i => i.Url)
                            .ToList()
                    }
                })
                .ToListAsync(ct);

            return wishlist;
        }
    }
}
