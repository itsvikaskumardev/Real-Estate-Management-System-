using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Documents.Commands
{
    public class CompleteOnboardingCommand : IRequest<bool>
    {
    }

    public class CompleteOnboardingCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService) 
        : IRequestHandler<CompleteOnboardingCommand, bool>
    {
        public async Task<bool> Handle(CompleteOnboardingCommand request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (userId == null)
                throw new UnauthorizedAccessException();

            var user = await context.Users.FindAsync(new object[] { userId.Value }, cancellationToken);
            if (user == null)
                throw new Exception("User not found");

            user.OnboardingStatus = "PendingReview";
            
            // Also update all documents from Uploaded to UnderReview
            var docs = await context.Documents
                .Where(d => d.UserId == userId && d.Status == "Uploaded")
                .ToListAsync(cancellationToken);
                
            foreach (var doc in docs)
            {
                doc.Status = "UnderReview";
            }

            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
