using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Documents.Queries
{
    public record DocumentDto(Guid Id, string DocumentType, string DocumentName, string FileUrl, string Status, DateTimeOffset? UploadedAt, DateTimeOffset? VerifiedAt);

    public class GetMyDocumentsQuery : IRequest<List<DocumentDto>> { }

    public class GetMyDocumentsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
        : IRequestHandler<GetMyDocumentsQuery, List<DocumentDto>>
    {
        public async Task<List<DocumentDto>> Handle(GetMyDocumentsQuery request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (userId == null)
                throw new UnauthorizedAccessException();

            var docs = await context.Documents
                .Where(d => d.UserId == userId)
                .Select(d => new DocumentDto(d.Id, d.DocumentType, d.DocumentName, d.FileUrl, d.Status, d.CreatedAt, d.VerifiedAt))
                .ToListAsync(cancellationToken);

            return docs;
        }
    }
}
