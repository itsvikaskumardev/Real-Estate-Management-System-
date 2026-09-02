using MediatR;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace RealEstate.Application.Admin.Commands
{
    public class VerifyDocumentCommand : IRequest<bool>
    {
        public Guid DocumentId { get; set; }
        public bool Approve { get; set; }
    }

    public class VerifyDocumentCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService) 
        : IRequestHandler<VerifyDocumentCommand, bool>
    {
        public async Task<bool> Handle(VerifyDocumentCommand request, CancellationToken cancellationToken)
        {
            var adminId = currentUserService.UserId;
            if (adminId == null) throw new UnauthorizedAccessException();

            var document = await context.Documents
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == request.DocumentId, cancellationToken);
                
            if (document == null) throw new Exception("Document not found");

            if (request.Approve)
            {
                document.Status = "Verified";
                document.VerifiedAt = DateTimeOffset.UtcNow;
                document.VerifiedBy = adminId;
            }
            else
            {
                document.Status = "Rejected";
                // When a document is rejected, the user's onboarding status reverts to Incomplete
                if (document.User != null)
                {
                    document.User.OnboardingStatus = "Incomplete";
                }
            }

            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
