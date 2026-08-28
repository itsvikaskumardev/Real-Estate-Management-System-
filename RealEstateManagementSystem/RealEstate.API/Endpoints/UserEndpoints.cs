using MediatR;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Users.Commands;
using RealEstate.Application.Users.Queries;

namespace RealEstate.API.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/user")
                .WithTags("Users");

            group.MapGet("/profile", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetProfileQuery());
                return Results.Ok(new { success = true, user = result });
            })
            .RequireAuthorization()
            .WithName("GetProfile");


            group.MapGet("/public/{id:Guid}", async (Guid id, [FromServices] ISender sender) =>
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
}
