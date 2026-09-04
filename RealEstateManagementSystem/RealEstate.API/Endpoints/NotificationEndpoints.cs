using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.Notifications.Commands;
using RealEstate.Application.Notifications.Queries;
using System;
using System.Threading.Tasks;

namespace RealEstate.API.Endpoints
{
    public static class NotificationEndpoints
    {
        public static void MapNotificationEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/notifications").WithTags("Notifications")
                .RequireAuthorization();

            group.MapGet("/", async (ISender sender) =>
            {
                var result = await sender.Send(new GetMyNotificationsQuery());
                return Results.Ok(result);
            });


            group.MapPut("/mark-read", async ([FromQuery] Guid? id, ISender sender) =>
            {
                await sender.Send(new MarkNotificationsAsReadCommand(id));
                return Results.Ok(new { success = true });
            });
        }
    }
}
