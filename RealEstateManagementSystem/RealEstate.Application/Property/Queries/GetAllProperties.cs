using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RealEstate.Application.Property.Dto;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Models;

namespace RealEstate.Application.Property.Queries
{

    public record GetAllPropertiesQuery : IRequest<PaginatedList<PropertyDto>>
    {
        public string? City { get; init; }
        public string? Area { get; init; }
        public string? Pincode { get; init; }
        public string? PropertyType { get; init; }   // comma-separated
        public string? Bhk { get; init; }
        public string? Furnishing { get; init; }      // comma-separated
        public string? Status { get; init; }
        public decimal? MinPrice { get; init; }
        public decimal? MaxPrice { get; init; }
        public string? Amenities { get; init; }       // comma-separated
        public int? MaxAgeDays { get; init; }
        public string? Sort { get; init; }
        public Guid? SellerId { get; init; }
        public int PageNumber { get; init; } = 1;
        public int PageSize { get; init; } = 12;
    }

    public class GetAllPropertiesQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<GetAllPropertiesQuery, PaginatedList<PropertyDto>>
    {
        public async Task<PaginatedList<PropertyDto>> Handle(
            GetAllPropertiesQuery request,
            CancellationToken ct)
        {
            var query = dbContext.Properties.Where(p => p.IsActive && !p.IsDeleted && p.IsVerified).AsQueryable();

            // Default status filter, overridden if 'status' is explicitly provided
            var status = PropertyStatus.Sale;
            if (!string.IsNullOrWhiteSpace(request.Status) &&
                Enum.TryParse<PropertyStatus>(request.Status, ignoreCase: true, out var parsedStatus))
            {
                status = parsedStatus;
            }
            query = query.Where(p => p.Status == status);

            if (request.SellerId is not null)
                query = query.Where(p => p.SellerId == request.SellerId);

            if (!string.IsNullOrWhiteSpace(request.City))
                query = query.Where(p => p.Address.City.ToLower().Contains(request.City.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.Area))
                query = query.Where(p => p.Address.Street.ToLower().Contains(request.Area.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.Pincode))
                query = query.Where(p => p.Address.Pincode == request.Pincode);

            if (!string.IsNullOrWhiteSpace(request.PropertyType))
            {
                var types = request.PropertyType
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(t => Enum.TryParse<PropertyType>(t, ignoreCase: true, out var pt) ? pt : (PropertyType?)null)
                    .Where(pt => pt is not null)
                    .Select(pt => pt!.Value)
                    .ToList();

                if (types.Count > 0)
                    query = query.Where(p => types.Contains(p.PropertyType));
            }

            if (!string.IsNullOrWhiteSpace(request.Bhk))
            {
                if (request.Bhk == "5+")
                    query = query.Where(p => p.Bhk != null && string.Compare(p.Bhk, "5") >= 0);
                else
                    query = query.Where(p => p.Bhk == request.Bhk);
            }

            if (!string.IsNullOrWhiteSpace(request.Furnishing))
            {
                var furnishings = request.Furnishing
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(f => Enum.TryParse<Furnishing>(f, ignoreCase: true, out var fu) ? fu : (Furnishing?)null)
                    .Where(fu => fu is not null)
                    .Select(fu => fu!.Value)
                    .ToList();

                if (furnishings.Count > 0)
                    query = query.Where(p => p.Furnishing != null && furnishings.Contains(p.Furnishing.Value));
            }

            if (request.MinPrice is not null)
                query = query.Where(p => p.Price >= request.MinPrice.Value);

            if (request.MaxPrice is not null)
                query = query.Where(p => p.Price <= request.MaxPrice.Value);

            if (!string.IsNullOrWhiteSpace(request.Amenities))
            {
                var amenitiesList = request.Amenities
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList();

                query = query.Where(p => p.Amenities.Any(a => amenitiesList.Contains(a)));
            }

            if (request.MaxAgeDays.HasValue && request.MaxAgeDays.Value > 0)
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-request.MaxAgeDays.Value);
                query = query.Where(p => p.CreatedAt >= cutoffDate);
            }

            query = request.Sort switch
            {
                "priceLow" => query.OrderBy(p => p.Price),
                "priceHigh" => query.OrderByDescending(p => p.Price),
                _ => query.OrderByDescending(p => p.CreatedAt) // "latest" and default
            };

            var projectedQuery = query.Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    Price = p.Price,
                    City = p.Address.City,
                    Area = p.Address.Street,
                    Pincode = p.Address.Pincode,
                    PropertyType = p.PropertyType.ToString(),
                    Bhk = p.Bhk,
                    Bathrooms = p.Bathrooms,
                    AreaSize = p.AreaSize,
                    Furnishing = p.Furnishing != null ? p.Furnishing.ToString() : null,
                    Status = p.Status.ToString(),
                    IsVerified = p.IsVerified,
                    Views = p.Views,
                    Amenities = p.Amenities,
                    Images = p.Images.Select(i => i.Url).ToList(),
                    CreatedAt = p.CreatedAt,
                    SellerId = p.SellerId,
                    Seller = p.Seller != null ? new SellerDto
                    {
                        Id = p.Seller.Id,
                        Name = p.Seller.Name,
                        Email = p.Seller.Email,
                        IsApproved = p.Seller.IsApproved,
                        ProfilePic = p.Seller.ProfilePic
                    } : null!
                });

            return await PaginatedList<PropertyDto>.CreateAsync(
                projectedQuery, 
                request.PageNumber > 0 ? request.PageNumber : 1, 
                request.PageSize > 0 ? request.PageSize : 12, 
                ct);
        }
    }
}
