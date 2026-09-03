using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.SavedSearches.Queries
{
    public class SavedSearchDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? City { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? Bhk { get; set; }
        public string? PropertyType { get; set; }
        public string? Status { get; set; }
        public bool EmailAlertsEnabled { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public record GetSavedSearchesQuery : IRequest<List<SavedSearchDto>>;

    public class GetSavedSearchesQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetSavedSearchesQuery, List<SavedSearchDto>>
    {
        public async Task<List<SavedSearchDto>> Handle(GetSavedSearchesQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return [];

            var buyerId = currentUserService.UserId.Value;

            return await dbContext.SavedSearches
                .Where(ss => ss.BuyerId == buyerId && !ss.IsDeleted)
                .OrderByDescending(ss => ss.CreatedAt)
                .Select(ss => new SavedSearchDto
                {
                    Id = ss.Id,
                    Title = ss.Title,
                    City = ss.City,
                    MinPrice = ss.MinPrice,
                    MaxPrice = ss.MaxPrice,
                    Bhk = ss.Bhk,
                    PropertyType = ss.PropertyType,
                    Status = ss.Status,
                    EmailAlertsEnabled = ss.EmailAlertsEnabled,
                    CreatedAt = ss.CreatedAt
                })
                .ToListAsync(ct);
        }
    }
}
