using MediatR;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Admin.Commands;
using RealEstate.Application.Admin.Queries;

namespace RealEstate.API.Endpoints
{

    public static class AdminEndpoints
    {
        public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/admin")
                .RequireAuthorization("AdminOnly")
                .WithTags("Admin");

            group.MapPost("/admins", async (CreateAdminCommand command, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Ok(new { success = true, result.Message, result.Admin });
            })
            .WithName("CreateAdmin");

            group.MapGet("/admins", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetAdminsQuery());
                return Results.Ok(new { success = true, result.Count, result.Admins });
            })
            .WithName("GetAdmins");

            group.MapGet("/users", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetAllUsersQuery());
                return Results.Ok(new { success = true, result.Count, result.Users });
            })
            .WithName("GetAllUsers");




            group.MapPatch("/users/{id:Guid}/block", async (Guid id, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new BlockUserCommand { UserId = id });
                return Results.Ok(result);
            })
            .WithName("BlockUser");




            group.MapGet("/properties", async ([AsParameters] GetAllPropertiesQuery query, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(query);
                return Results.Ok(new 
                { 
                    success = true, 
                    count = result.TotalCount, 
                    properties = result.Items,
                    pageNumber = result.PageNumber,
                    pageSize = result.PageSize,
                    totalPages = result.TotalPages 
                });
            })
            .WithName("GetAllProperties");



            group.MapGet("/inquiries", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetAllInquiriesQuery());
                return Results.Ok(new { success = true, result.Count, result.Inquiries });
            })
            .WithName("GetAllInquiries");




            group.MapGet("/stats", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetDashboardStatsQuery());
                return Results.Ok(new { success = true, stats = result });
            })
            .WithName("GetDashboardStats");




            group.MapGet("/pending-sellers", async ([FromServices] ISender sender) =>
            {
                var result = await sender.Send(new GetPendingSellersQuery());
                return Results.Ok(new { success = true, result.Count, result.PendingSellers });
            })
            .WithName("GetPendingSellers");



            group.MapPatch("/approve-seller/{id:Guid}", async (Guid id, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new ApproveSellerCommand { SellerId = id });
                return Results.Ok(result);
            })
            .WithName("ApproveSeller");


            group.MapDelete("/users/{id:Guid}", async (Guid id, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new DeleteUserCommand { UserId = id });
                return Results.Ok(result);
            })
            .WithName("DeleteUser");


            group.MapDelete("/properties/{id:Guid}", async (Guid id, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new DeletePropertyCommand { PropertyId = id });
                return Results.Ok(result);
            })
            .WithName("DeleteProperty");


            group.MapPatch("/properties/{id:Guid}/verify", async (Guid id, [FromBody] VerifyPropertyRequest request, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new VerifyPropertyCommand(id, request.Approve));
                return Results.Ok(new { success = result });
            })
            .WithName("VerifyProperty");

            group.MapGet("/seller/documents/{documentId:Guid}/view", async (Guid documentId, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new ViewDocumentQuery(documentId));
                return Results.Stream(result.Stream, result.ContentType);
            })
            .WithName("ViewDocument");

            group.MapPatch("/seller/documents/{documentId:Guid}/verify", async (Guid documentId, [FromBody] VerifyDocumentRequest request, [FromServices] ISender sender) =>
            {
                var result = await sender.Send(new VerifyDocumentCommand { DocumentId = documentId, Approve = request.Approve });
                return Results.Ok(new { success = result });
            })
            .WithName("VerifyDocument");

        }


    }
    
    public record VerifyPropertyRequest(bool Approve);
    public record VerifyDocumentRequest(bool Approve);
}
