using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.PropertyOffers.Commands;
using RealEstate.Application.PropertyOffers.Queries;
using System;
using System.Threading.Tasks;

namespace RealEstate.API.Endpoints
{
    public record CreateOfferRequest(Guid PropertyId, decimal OfferAmount, string Message);
    public record UpdateOfferRequest(string Status);

    public static class OfferEndpoints
    {
        public static void MapOfferEndpoints(this IEndpointRouteBuilder app)
        {
            var buyerGroup = app.MapGroup("/api/buyer/offers").WithTags("Offers")
                .RequireAuthorization(policy => policy.RequireRole("buyer", "Buyer"));

            buyerGroup.MapPost("/", async ([FromBody] CreateOfferRequest req, ISender sender) =>
            {
                var result = await sender.Send(new CreateOfferCommand(req.PropertyId, req.OfferAmount, req.Message));
                return Results.Ok(new { success = true, offerId = result });
            });

            buyerGroup.MapGet("/", async (ISender sender) =>
            {
                var result = await sender.Send(new GetBuyerOffersQuery());
                return Results.Ok(result);
            });


            var sellerGroup = app.MapGroup("/api/seller/offers").WithTags("Offers")
                .RequireAuthorization(policy => policy.RequireRole("seller", "Seller"));

            sellerGroup.MapGet("/", async (ISender sender) =>
            {
                var result = await sender.Send(new GetSellerOffersQuery());
                return Results.Ok(result);
            });

            sellerGroup.MapPut("/{id:Guid}/status", async (Guid id, [FromBody] UpdateOfferRequest req, ISender sender) =>
            {
                await sender.Send(new UpdateOfferStatusCommand(id, req.Status));
                return Results.Ok(new { success = true });
            });
        }
    }
}
