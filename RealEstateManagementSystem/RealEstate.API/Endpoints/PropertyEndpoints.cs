using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.Properties.Queries;

namespace RealEstate.API.Endpoints
{
    public static class PropertyEndpoints
    {
        public static void MapPropertyEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/property");

            group.MapGet("/counts", async ([FromServices] ISender sender) =>
            {
                var counts = await sender.Send(new GetPropertyCountsQuery());
                return Results.Ok(new { success = true, counts });
            }).WithName("GetPropertyCounts");

            group.MapGet("/", async ([AsParameters] GetPropertiesQuery query, [FromServices] ISender sender) =>
            {
                var properties = await sender.Send(query);
                return Results.Ok(new { success = true, properties });
            }).WithName("GetProperties");
        }
    }
}
