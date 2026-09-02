using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.Documents.Commands;
using RealEstate.Application.Documents.Queries;
using System;

namespace RealEstate.API.Endpoints
{
    public static class DocumentEndpoints
    {
        public static void MapDocumentEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/seller/documents")
                .WithTags("Documents")
                .RequireAuthorization();

            group.MapGet("/", async (ISender sender) =>
            {
                var result = await sender.Send(new GetMyDocumentsQuery());
                return Results.Ok(new { success = true, documents = result });
            })
            .WithName("GetMyDocuments");

            group.MapPost("/upload", async ([FromForm] UploadDocumentRequest request, ISender sender) =>
            {
                if (request.File == null) return Results.BadRequest("File is required");

                var result = await sender.Send(new UploadDocumentCommand
                {
                    DocumentType = request.DocumentType,
                    FileStream = request.File.OpenReadStream(),
                    FileName = request.File.FileName
                });
                return Results.Ok(new { success = true, documentId = result });
            })
            .DisableAntiforgery()
            .WithName("UploadDocument");

            group.MapPost("/complete-onboarding", async (ISender sender) =>
            {
                var result = await sender.Send(new CompleteOnboardingCommand());
                return Results.Ok(new { success = result });
            })
            .WithName("CompleteOnboarding");
        }
    }

    public record UploadDocumentRequest
    {
        public string DocumentType { get; init; } = string.Empty;
        public IFormFile? File { get; init; }
    }
}
