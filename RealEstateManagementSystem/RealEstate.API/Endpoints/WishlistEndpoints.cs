using MediatR;
using RealEstate.Application.Wishlist.Commands;

namespace RealEstate.API.Endpoints
{
    public static class WishlistEndpoints
    {
        public static void MapWishlistEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/wishlist");
            group.MapPost("/{propertyId:Guid}", async (Guid propertyId, ISender sender) =>
            {
                var result = await sender.Send(new AddToWishlistCommand { PropertyId = propertyId });
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .WithName("AddToWishlist");
        }
    }
}
