using MediatR;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Auth.Commands;
using RealEstate.Application.Auth.Queries;

namespace RealEstate.API.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/auth")
                .WithTags("Auth");

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

            group.MapGet("/me", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetMeQuery());
                return Results.Ok(new { success = true, user = result });
            })
            .RequireAuthorization()
            .WithName("GetMe");

            group.MapPost("/forgot-password", async (ForgotPasswordCommand command, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Ok(result);
            })
            .WithName("ForgotPassword");

            group.MapPost("/reset-password/{token}", async (string token, ResetPasswordRequestBody body, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new ResetPasswordCommand
                {
                    Token = token,
                    Password = body.Password
                });
                return Results.Ok(result);
            })
            .WithName("ResetPassword");
        }
    }

    // small record to bind the body separately from the route param
    public record ResetPasswordRequestBody(string Password);
}
