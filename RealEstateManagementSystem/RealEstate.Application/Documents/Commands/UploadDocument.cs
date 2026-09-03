using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Documents.Commands
{
    public class UploadDocumentCommand : IRequest<Guid>
    {
        public string DocumentType { get; set; } = string.Empty;
        public Stream FileStream { get; set; } = null!;
        public string FileName { get; set; } = string.Empty;
    }

    public class UploadDocumentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService)
        : IRequestHandler<UploadDocumentCommand, Guid>
    {
        public async Task<Guid> Handle(UploadDocumentCommand request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (userId == null)
                throw new UnauthorizedAccessException();

            var url = await fileStorageService.UploadAsync(
                request.FileStream,
                request.FileName,
                "RealState",
                cancellationToken);

            var existingDoc = await context.Documents
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DocumentType == request.DocumentType, cancellationToken);

            if (existingDoc != null)
            {
                existingDoc.FileUrl = url;
                existingDoc.DocumentName = request.FileName;
                existingDoc.Status = "Uploaded";
                existingDoc.VerifiedAt = null;
                existingDoc.VerifiedBy = null;

                await context.SaveChangesAsync(cancellationToken);
                return existingDoc.Id;
            }

            var newDoc = new Document
            {
                UserId = userId.Value,
                DocumentType = request.DocumentType,
                DocumentName = request.FileName,
                FileUrl = url,
                Status = "Uploaded"
            };

            await context.Documents.AddAsync(newDoc);
            await context.SaveChangesAsync(cancellationToken);
            return newDoc.Id;
        }
    }
}
