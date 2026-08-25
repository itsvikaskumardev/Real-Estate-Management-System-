using MediatR;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Properties.Queries;
using RealEstate.Application.Users.Commands;

namespace RealEstate.API.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/auth");

            group.MapPost("/register", async (RegisterUserCommand command, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Created(string.Empty, result);
            })
            .WithName("RegisterUser");

            group.MapPost("/verify-email", async (VerifyEmailCommand command, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Ok(result);
            })
            .WithName("VerifyEmail");

            group.MapPost("/login", async (LoginCommand command, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Ok(result);
            })
            .WithName("Login");
        }
    }
}
