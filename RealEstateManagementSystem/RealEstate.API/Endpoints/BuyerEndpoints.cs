using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.Buyer.Queries;
using System.Threading.Tasks;

namespace RealEstate.API.Endpoints
{
    public static class BuyerEndpoints
    {
        public static void MapBuyerEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/buyer")
                .RequireAuthorization(policy => policy.RequireRole("buyer", "Buyer"));

            group.MapGet("/dashboard", GetBuyerDashboard);

            group.MapPost("/purchase/{id:Guid}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new RealEstate.Application.Buyer.Commands.PurchasePropertyCommand(id));
                return Results.Ok(new { success = result });
            })
            .WithName("PurchaseProperty");
        }

        private static async Task<IResult> GetBuyerDashboard(IMediator mediator)
        {
            var query = new GetBuyerDashboardQuery();
            var result = await mediator.Send(query);
            return Results.Ok(result);
        }
    }
}
