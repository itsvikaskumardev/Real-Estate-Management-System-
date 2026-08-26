using MediatR;
using RealEstate.Application.Wishlist.Commands;
using RealEstate.Application.Wishlist.Queries;

namespace RealEstate.API.Endpoints
{
    public static class WishlistEndpoints
    {
        public static void MapWishlistEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/wishlist")
                .WithTags("Wishlist");

            group.MapPost("/{propertyId:Guid}", async (Guid propertyId, ISender sender) =>
            {
                var result = await sender.Send(new AddToWishlistCommand { PropertyId = propertyId });
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .WithName("AddToWishlist");


            group.MapGet("/", async (ISender sender) =>
            {
                var result = await sender.Send(new GetWishlistQuery());
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .WithName("GetWishlist");


            group.MapDelete("/{propertyId:Guid}", async (Guid propertyId, ISender sender) =>
            {
                var result = await sender.Send(new RemoveFromWishlistCommand { PropertyId = propertyId });
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .WithName("RemoveFromWishlist");
        }
    }
}
