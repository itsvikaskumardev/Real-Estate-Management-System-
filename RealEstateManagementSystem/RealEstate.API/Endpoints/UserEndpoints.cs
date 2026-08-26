using MediatR;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Properties.Queries;
using RealEstate.Application.Users.Commands;
using RealEstate.Application.Users.Queries;

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



            group.MapGet("/profile", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetProfileQuery());
                return Results.Ok(new { success = true, user = result });
            })
            .RequireAuthorization()
            .WithName("GetProfile");


            group.MapGet("/{id:Guid}/public-profile", async (Guid id, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetPublicProfileQuery { UserId = id });
                return Results.Ok(new { success = true, user = result });
            })
            .WithName("GetPublicProfile");



            group.MapPut("/profile", async (HttpRequest httpRequest, [FromServices] ISender sender) =>
            {
                var form = await httpRequest.ReadFormAsync();

                var file = form.Files.GetFile("profilePic");
                Stream? fileStream = null;
                string? fileName = null;

                if (file is not null)
                {
                    fileStream = file.OpenReadStream();
                    fileName = file.FileName;
                }

                var command = new UpdateProfileCommand
                {
                    Name = form["name"].FirstOrDefault(),
                    Phone = form["phone"].FirstOrDefault(),
                    Address = form["address"].FirstOrDefault(),
                    RemoveProfilePic = form["removeProfilePic"].FirstOrDefault() == "true",
                    ProfilePicStream = fileStream,
                    ProfilePicFileName = fileName
                };

                var result = await sender.Send(command);
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .DisableAntiforgery()
            .WithName("UpdateProfile");
        }
    }

    // small record to bind the body separately from the route param
    public record ResetPasswordRequestBody(string Password);
}
