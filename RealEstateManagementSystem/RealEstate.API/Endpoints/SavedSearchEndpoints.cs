using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.SavedSearches.Commands;
using RealEstate.Application.SavedSearches.Queries;
using System;

namespace RealEstate.API.Endpoints
{
    public static class SavedSearchEndpoints
    {
        public static void MapSavedSearchEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/buyer/saved-searches").WithTags("Saved-Searches")
                .RequireAuthorization(policy => policy.RequireRole("buyer", "Buyer"));

            group.MapPost("/", async ([FromBody] CreateSavedSearchCommand command, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(command);
                return result ? Results.Ok(new { success = true }) : Results.BadRequest(new { success = false, message = "Failed to save search." });
            })
            .WithName("CreateSavedSearch");

            group.MapGet("/", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetSavedSearchesQuery());
                return Results.Ok(result);
            })
            .WithName("GetSavedSearches");

            group.MapGet("/{id:Guid}/matches", async (Guid id, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetMatchingPropertiesQuery(id));
                return Results.Ok(new { success = true, matches = result });
            })
            .WithName("GetMatchingProperties");
        }
    }
}
