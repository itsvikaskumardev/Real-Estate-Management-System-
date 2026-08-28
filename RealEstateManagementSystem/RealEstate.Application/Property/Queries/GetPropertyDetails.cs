using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Property.Dto;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Property.Queries
{
    public record GetPropertyDetailsQuery : IRequest<GetPropertyDetailsResponse>
    {
        public Guid PropertyId { get; init; }
    }

    public record GetPropertyDetailsResponse
    {
        public PropertyDetailDto Property { get; init; } = null!;
        public List<SimilarPropertyDto> SimilarProperties { get; init; } = [];
    }

    public record SimilarPropertyDto
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public List<string> Images { get; init; } = [];
        public string City { get; init; } = string.Empty;
        public string Area { get; init; } = string.Empty;
        public string PropertyType { get; init; } = string.Empty;
        public string? Bhk { get; init; }
        public decimal? AreaSize { get; init; }
        public string Status { get; init; } = string.Empty;
    }

    public class GetPropertyDetailsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<GetPropertyDetailsQuery, GetPropertyDetailsResponse>
    {
        public async Task<GetPropertyDetailsResponse> Handle(
            GetPropertyDetailsQuery request,
            CancellationToken cancellationToken)
        {
            var property = await context.Properties
                .Include(p => p.Seller)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken);

            if (property is null)
                throw new NotFoundException(nameof(RealEstate.Domain.Entities.Property), request.PropertyId);

            // Identify visitor: JWT user id if authenticated, otherwise IP
            var visitorId = currentUser.UserId?.ToString() ?? currentUser.IpAddress ?? "unknown";
            var isSellerChecking = currentUser.UserId == property.SellerId;

            if (!isSellerChecking && !property.ViewedBy.Contains(visitorId))
            {
                property.Views += 1;
                property.ViewedBy.Add(visitorId);
                await context.SaveChangesAsync(cancellationToken);
            }

            var similarProperties = await context.Properties
                .Where(p =>
                    p.Id != property.Id &&
                    p.Address.City == property.Address.City &&
                    p.PropertyType == property.PropertyType &&
                    p.Status == property.Status)
                .Take(4)
                .Select(p => new SimilarPropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Price = p.Price,
                    Images = p.Images.Select(i => i.Url).ToList(),
                    City = p.Address.City,
                    Area = p.Address.Street,
                    PropertyType = p.PropertyType.ToString(),
                    Bhk = p.Bhk,
                    AreaSize = p.AreaSize,
                    Status = p.Status.ToString()
                })
                .ToListAsync(cancellationToken);

            return new GetPropertyDetailsResponse
            {
                Property = new PropertyDetailDto
                {
                    Id = property.Id,
                    Title = property.Title,
                    Description = property.Description,
                    Price = property.Price,
                    City = property.Address.City,
                    Area = property.Address.Street,
                    PropertyType = property.PropertyType.ToString(),
                    Bhk = property.Bhk,
                    AreaSize = property.AreaSize,
                    Status = property.Status.ToString(),
                    Views = property.Views,
                    Amenities = property.Amenities,
                    Images = property.Images.Select(i => i.Url).ToList(),
                    Seller = new SellerDto
                    {
                        Id = property.Seller.Id,
                        Name = property.Seller.Name,
                        Email = property.Seller.Email,
                        IsApproved = property.Seller.IsApproved,
                        ProfilePic = property.Seller.ProfilePic
                    }
                },
                SimilarProperties = similarProperties
            };
        }
    }
}
