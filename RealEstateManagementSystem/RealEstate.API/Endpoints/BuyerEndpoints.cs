using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.Buyer.Queries;
using System.Threading.Tasks;
using RealEstate.Application.Buyer.Commands;
using Microsoft.AspNetCore.Mvc;
namespace RealEstate.API.Endpoints
{
    public class PurchaseRequestDto
    {
        public bool UseApprovedOfferPrice { get; set; }
    }

    public static class BuyerEndpoints
    {
        public static void MapBuyerEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/buyer").WithTags("Buyer")
                .RequireAuthorization(policy => policy.RequireRole("buyer", "Buyer"));

            group.MapGet("/dashboard", async (IMediator mediator) =>
            {
                var query = new GetBuyerDashboardQuery();
                var result = await mediator.Send(query);
                return Results.Ok(result);
            });

            group.MapPost("/purchase/{id:Guid}", async (Guid id, [FromBody] PurchaseRequestDto request, ISender sender) =>
            {
                var result = await sender.Send(new PurchasePropertyCommand(id, request.UseApprovedOfferPrice));
                if (result == null)
                    return Results.BadRequest(new { success = false, message = "Purchase failed." });
                return Results.Ok(new { success = true, transactionId = result });
            })
            .WithName("PurchaseProperty");

            group.MapGet("/invoice/{id:Guid}", async (Guid id, IMediator mediator) =>
            {
                var html = await mediator.Send(new GetTransactionInvoiceHtmlQuery(id));
                if (html == null)
                    return Results.NotFound("Invoice not found or unauthorized.");
                
                return Results.Text(html, "text/html");
            })
            .WithName("GetInvoiceHtml");
        }
    }
}
