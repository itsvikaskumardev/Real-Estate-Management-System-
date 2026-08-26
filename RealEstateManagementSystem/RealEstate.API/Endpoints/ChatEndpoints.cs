using MediatR;
using RealEstate.Application.Chats.Commands;
using RealEstate.Application.Chats.Queries;

namespace RealEstate.API.Endpoints
{
    public static class ChatEndpoints
    {
        public static void MapChatEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/chat")
                .RequireAuthorization();

            group.MapPost("/start", async (StartOrGetChatCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Ok(result);
            })
            .WithName("StartOrGetChat");

            group.MapPost("/send", async (SendMessageCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Ok(result);
            })
            .WithName("SendMessage");


            group.MapGet("/user", async (ISender sender) =>
            {
                var result = await sender.Send(new GetUserChatsQuery());
                return Results.Ok(result);
            })
            .WithName("GetUserChats");


            group.MapGet("/{chatId:Guid}", async (Guid chatId, ISender sender) =>
            {
                var result = await sender.Send(new GetChatByIdQuery { ChatId = chatId });
                return Results.Ok(result);
            })
            .WithName("GetChatById");


            group.MapDelete("/{chatId:Guid}", async (Guid chatId, ISender sender) =>
            {
                var result = await sender.Send(new DeleteChatCommand { ChatId = chatId });
                return Results.Ok(result);
            })
            .WithName("DeleteChat");
        }
    }
}
