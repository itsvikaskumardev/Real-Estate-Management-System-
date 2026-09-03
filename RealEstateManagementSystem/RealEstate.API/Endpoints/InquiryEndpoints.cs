using MediatR;
using RealEstate.Application.Inquiries.Commands;
using RealEstate.Application.Inquiries.Queries;

namespace RealEstate.API.Endpoints
{
    public static class InquiryEndpoints
    {
        public static void MapInquiryEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/inquiry")
                .WithTags("Inquiries");
            group.MapPost("/", async (SendInquiryCommand command, ISender sender) =>
            {
                var result = await sender.Send(command);
                return Results.Created(string.Empty, result);
            })
            .RequireAuthorization()
            .WithName("SendInquiry");


            group.MapGet("/seller", async (ISender sender) =>
            {
                var result = await sender.Send(new GetSellerInquiriesQuery());
                return Results.Ok(new { success = true, result.Count, result.Inquiries });
            })
            .RequireAuthorization()
            .WithName("GetSellerInquiries");

            group.MapGet("/my", async (ISender sender) =>
            {
                var result = await sender.Send(new GetBuyerInquiriesQuery());
                return Results.Ok(new { success = true, result.Count, result.Inquiries });
            })
            .RequireAuthorization()
            .WithName("GetBuyerInquiries");

            group.MapPatch("/{id:Guid}/read", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new MarkInquiryAsReadCommand { InquiryId = id });
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .WithName("MarkInquiryAsRead");
        }
    }
}
