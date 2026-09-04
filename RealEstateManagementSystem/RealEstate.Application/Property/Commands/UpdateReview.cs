using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Property.Commands
{
    public record UpdateReviewCommand(Guid ReviewId, int Rating, string Comment) : IRequest;

    public class UpdateReviewCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService) : IRequestHandler<UpdateReviewCommand>
    {
        public async Task Handle(UpdateReviewCommand request, CancellationToken ct)
        {
            var userId = currentUserService.UserId;
            if (userId == null || userId == Guid.Empty)
                throw new UnauthorizedAccessException("User is not authenticated");
            var parsedUserId = userId.Value;

            var review = await dbContext.Reviews.FirstOrDefaultAsync(r => r.Id == request.ReviewId, ct);
            if (review == null)
                throw new Exception("Review not found");

            if (review.BuyerId != parsedUserId)
                throw new UnauthorizedAccessException("You can only edit your own reviews.");

            review.Rating = request.Rating;
            review.Comment = request.Comment;

            await dbContext.SaveChangesAsync(ct);
        }
    }
}
