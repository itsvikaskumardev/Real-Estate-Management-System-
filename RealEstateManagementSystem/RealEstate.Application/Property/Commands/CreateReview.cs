using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Property.Commands
{
    public record CreateReviewCommand(Guid PropertyId, int Rating, string Comment) : IRequest<Guid>;

    public class CreateReviewCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService) : IRequestHandler<CreateReviewCommand, Guid>
    {
        public async Task<Guid> Handle(CreateReviewCommand request, CancellationToken ct)
        {
            var userId = currentUserService.UserId;
            if (userId == null || userId == Guid.Empty)
                throw new UnauthorizedAccessException("User is not authenticated");
            var parsedUserId = userId.Value;

            var property = await dbContext.Properties.FirstOrDefaultAsync(p => p.Id == request.PropertyId, ct);
            if (property == null)
                throw new Exception("Property not found");

            var review = new Review
            {
                PropertyId = request.PropertyId,
                BuyerId = parsedUserId,
                Rating = request.Rating,
                Comment = request.Comment
            };

            dbContext.Reviews.Add(review);
            await dbContext.SaveChangesAsync(ct);

            return review.Id;
        }
    }
}
