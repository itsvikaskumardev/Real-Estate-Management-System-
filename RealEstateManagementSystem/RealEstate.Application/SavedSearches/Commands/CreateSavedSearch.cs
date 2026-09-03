using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.SavedSearches.Commands
{
    public class CreateSavedSearchCommand : IRequest<bool>
    {
        public string Title { get; set; } = null!;
        public string? City { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? Bhk { get; set; }
        public string? PropertyType { get; set; }
        public string? Status { get; set; }
        public bool EmailAlertsEnabled { get; set; } = true;
    }

    public class CreateSavedSearchCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<CreateSavedSearchCommand, bool>
    {
        public async Task<bool> Handle(CreateSavedSearchCommand request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return false;

            var buyerId = currentUserService.UserId.Value;

            var savedSearch = new SavedSearch
            {
                BuyerId = buyerId,
                Title = request.Title,
                City = request.City,
                MinPrice = request.MinPrice,
                MaxPrice = request.MaxPrice,
                Bhk = request.Bhk,
                PropertyType = request.PropertyType,
                Status = request.Status,
                EmailAlertsEnabled = request.EmailAlertsEnabled
            };

            dbContext.SavedSearches.Add(savedSearch);
            await dbContext.SaveChangesAsync(ct);

            return true;
        }
    }
}
