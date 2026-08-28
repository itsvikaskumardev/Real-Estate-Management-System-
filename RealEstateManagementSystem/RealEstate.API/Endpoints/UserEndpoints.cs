using MediatR;
using Microsoft.AspNetCore.Mvc;
using RealEstate.API.Dto;
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



            group.MapPut("/profile", async ([FromForm] UpdateProfileRequest request, [FromServices] ISender sender) =>
            {
                var command = new UpdateProfileCommand
                {
                    Name = request.Name,
                    Phone = request.Phone,
                    Address = request.Address,
                    RemoveProfilePic = request.RemoveProfilePic,
                    ProfilePicStream = request.ProfilePic?.OpenReadStream(),
                    ProfilePicFileName = request.ProfilePic?.FileName
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
