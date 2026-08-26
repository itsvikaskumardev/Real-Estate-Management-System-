using MediatR;
using RealEstate.Application.Contacts.Commands;
using RealEstate.Application.Contacts.Queries;

namespace RealEstate.API.Endpoints
{
    public static class ContactEndpoints
    {
        public static void MapContactEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/contact")
                .WithTags("Contact");

            group.MapPost("/", async (CreateContactCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Created(string.Empty, result);
            })
            .WithName("CreateContact");


            group.MapGet("/contacts", async (ISender sender) =>
            {
                var result = await sender.Send(new GetAllContactsQuery());
                return Results.Ok(new { success = true, result.Contacts });
            })
            .WithName("GetAllContacts");
        }
    }
}
