using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Property.Commands
{
    public record DeleteReviewCommand(Guid ReviewId) : IRequest;

    public class DeleteReviewCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService) : IRequestHandler<DeleteReviewCommand>
    {
        public async Task Handle(DeleteReviewCommand request, CancellationToken ct)
        {
            var userId = currentUserService.UserId;
            if (userId == null || userId == Guid.Empty)
                throw new UnauthorizedAccessException("User is not authenticated");
            var parsedUserId = userId.Value;

            var review = await dbContext.Reviews.FirstOrDefaultAsync(r => r.Id == request.ReviewId, ct);
            if (review == null)
                throw new Exception("Review not found");

            if (review.BuyerId != parsedUserId)
                throw new UnauthorizedAccessException("You can only delete your own reviews.");

            dbContext.Reviews.Remove(review);
            await dbContext.SaveChangesAsync(ct);
        }
    }
}
