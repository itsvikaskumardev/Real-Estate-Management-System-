using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Admin.Queries
{
    public record ViewDocumentQuery(Guid DocumentId) : IRequest<DocumentStreamResponse>;

    public record DocumentStreamResponse(Stream Stream, string ContentType);

    public class ViewDocumentQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<ViewDocumentQuery, DocumentStreamResponse>
    {
        private static readonly HttpClient _httpClient = new HttpClient();

        public async Task<DocumentStreamResponse> Handle(ViewDocumentQuery request, CancellationToken ct)
        {
            var document = await dbContext.Documents.FirstOrDefaultAsync(d => d.Id == request.DocumentId, ct);
            
            if (document == null)
                throw new BadRequestException("Document not found");

            var response = await _httpClient.GetAsync(document.FileUrl, HttpCompletionOption.ResponseHeadersRead, ct);
            
            if (!response.IsSuccessStatusCode)
                throw new Exception("Failed to fetch document from cloud storage.");

            var stream = await response.Content.ReadAsStreamAsync(ct);
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "application/octet-stream";

            return new DocumentStreamResponse(stream, contentType);
        }
    }
}
