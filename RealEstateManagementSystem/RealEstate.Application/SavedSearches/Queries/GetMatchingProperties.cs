using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Property.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RealEstate.Application.Admin.Dto;

namespace RealEstate.Application.SavedSearches.Queries
{
    public record GetMatchingPropertiesQuery(Guid SavedSearchId) : IRequest<List<PropertyDto>>;

    public class GetMatchingPropertiesQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetMatchingPropertiesQuery, List<PropertyDto>>
    {
        public async Task<List<PropertyDto>> Handle(GetMatchingPropertiesQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return [];

            var savedSearch = await dbContext.SavedSearches
                .FirstOrDefaultAsync(ss => ss.Id == request.SavedSearchId && ss.BuyerId == currentUserService.UserId.Value, ct);

            if (savedSearch == null)
                return [];

            var query = dbContext.Properties
                .Include(p => p.Seller)
                .Include(p => p.Images)
                .Where(p => p.IsActive && p.IsVerified);

            if (!string.IsNullOrEmpty(savedSearch.City))
                query = query.Where(p => p.Address.City.ToLower().Contains(savedSearch.City.ToLower()));

            if (savedSearch.MinPrice.HasValue)
                query = query.Where(p => p.Price >= savedSearch.MinPrice.Value);

            if (savedSearch.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= savedSearch.MaxPrice.Value);

            if (savedSearch.Bhk.HasValue)
                query = query.Where(p => p.Bhk == savedSearch.Bhk.Value.ToString());

            if (!string.IsNullOrEmpty(savedSearch.PropertyType) && Enum.TryParse<RealEstate.Domain.Enums.PropertyType>(savedSearch.PropertyType, true, out var pType))
                query = query.Where(p => p.PropertyType == pType);

            if (!string.IsNullOrEmpty(savedSearch.Status) && Enum.TryParse<RealEstate.Domain.Enums.PropertyStatus>(savedSearch.Status, true, out var pStatus))
                query = query.Where(p => p.Status == pStatus);

            return await query
                .OrderByDescending(p => p.CreatedAt)
                .Take(10) // Limit to top 10 recent matches
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    Price = p.Price,
                    City = p.Address.City,
                    Area = p.Address.Street,
                    Bhk = p.Bhk,
                    PropertyType = p.PropertyType.ToString(),
                    Status = p.Status.ToString(),
                    Images = p.Images.Select(i => i.Url).ToList(),
                    Seller = new SellerDto { Id = p.Seller.Id, Name = p.Seller.Name }
                })
                .ToListAsync(ct);
        }
    }
}
