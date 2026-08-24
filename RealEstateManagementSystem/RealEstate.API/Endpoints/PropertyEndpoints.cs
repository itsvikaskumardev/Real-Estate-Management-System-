using Microsoft.AspNetCore.Hosting.Server;

namespace RealEstate.API.Endpoints
{
    public static class PropertyEndpoints
    {
        public static void MapPropertyEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/properties");

            /*
            group.MapGet("/{id:guid}", async (
                Guid id,
                ISender sender) =>
            {
                var result = await sender.Send(
                    new GetPropertyByIdQuery(id));

                return Results.Ok(result);
            });

            group.MapPost("/", async (
                CreatePropertyCommand command,
                ISender sender) =>
            {
                var result = await sender.Send(command);

                return Results.Ok(result);
            });
            */
        }
    }
}
