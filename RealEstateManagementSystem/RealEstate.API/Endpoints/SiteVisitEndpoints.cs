using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.SiteVisits.Commands;
using RealEstate.Application.SiteVisits.Queries;
using System;

namespace RealEstate.API.Endpoints
{
    public static class SiteVisitEndpoints
    {
        public static void MapSiteVisitEndpoints(this IEndpointRouteBuilder app)
        {
            var buyerGroup = app.MapGroup("/api/buyer/visits")
                .RequireAuthorization(policy => policy.RequireRole("buyer", "Buyer"));

            buyerGroup.MapPost("/schedule", async ([FromBody] ScheduleVisitCommand command, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(command);
                return result ? Results.Ok(new { success = true }) : Results.BadRequest(new { success = false, message = "Failed to schedule visit." });
            })
            .WithName("ScheduleVisit");

            buyerGroup.MapGet("/", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetBuyerVisitsQuery());
                return Results.Ok(new { success = true, visits = result });
            })
            .WithName("GetBuyerVisits");


            var sellerGroup = app.MapGroup("/api/seller/visits")
                .RequireAuthorization(policy => policy.RequireRole("seller", "Seller"));

            sellerGroup.MapGet("/", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetSellerVisitsQuery());
                return Results.Ok(new { success = true, visits = result });
            })
            .WithName("GetSellerVisits");

            sellerGroup.MapPatch("/{id:Guid}/status", async (Guid id, [FromBody] UpdateVisitStatusCommand command, [FromServices] ISender sender) =>
            {
                var cmd = new UpdateVisitStatusCommand { VisitId = id, Status = command.Status };
                var result = await sender.Send(cmd);
                return result ? Results.Ok(new { success = true }) : Results.BadRequest(new { success = false, message = "Failed to update status." });
            })
            .WithName("UpdateVisitStatus");
        }
    }
}
