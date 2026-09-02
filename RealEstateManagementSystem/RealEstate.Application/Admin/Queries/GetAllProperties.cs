using MediatR;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RealEstate.Application.Property.Dto;

namespace RealEstate.Application.Admin.Queries
{
    public record GetAllPropertiesQuery : IRequest<GetAllPropertiesResponse>
    {
        public string? Search { get; init; } // Title, city, seller name/email
        public bool? IsVerified { get; init; }
        public string? Status { get; init; }
    }

    public record GetAllPropertiesResponse
    {
        public int Count { get; init; }
        public List<PropertyDto> Properties { get; init; } = [];
    }

    public class GetAllPropertiesQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<GetAllPropertiesQuery, GetAllPropertiesResponse>
    {
        public async Task<GetAllPropertiesResponse> Handle(
            GetAllPropertiesQuery request,
            CancellationToken ct)
        {
            var query = dbContext.Properties
                .Where(p => p.IsActive && !p.IsDeleted)
                .AsQueryable();

            if (request.IsVerified.HasValue)
            {
                query = query.Where(p => p.IsVerified == request.IsVerified.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                if (Enum.TryParse<RealEstate.Domain.Enums.PropertyStatus>(request.Status, ignoreCase: true, out var parsedStatus))
                {
                    query = query.Where(p => p.Status == parsedStatus);
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.ToLower();
                query = query.Where(p => 
                    p.Title.ToLower().Contains(search) || 
                    p.Address.City.ToLower().Contains(search) ||
                    (p.Seller != null && p.Seller.Name.ToLower().Contains(search)) ||
                    (p.Seller != null && p.Seller.Email.ToLower().Contains(search))
                );
            }

            var properties = await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Price = p.Price,
                    City = p.Address.City,
                    Bathrooms = p.Bathrooms,
                    Bhk = p.Bhk,
                    AreaSize = p.AreaSize,
                    PropertyType = p.PropertyType.ToString(),
                    Status = p.Status.ToString(),
                    IsVerified = p.IsVerified,
                    CreatedAt = p.CreatedAt,
                    Seller = new SellerDto
                    {
                        Id = p.Seller.Id,
                        Name = p.Seller.Name,
                        Email = p.Seller.Email
                    }
                })
                .ToListAsync(ct);

            return new GetAllPropertiesResponse
            {
                Count = properties.Count,
                Properties = properties
            };
        }
    }
}
