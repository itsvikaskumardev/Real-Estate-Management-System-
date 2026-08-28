using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RealEstate.Application.Property.Dto;

namespace RealEstate.Application.Property.Queries
{
    public class GetPropertiesQuery : IRequest<List<PropertyDto>>
    {
        public string? City { get; set; }
    }

    public class GetPropertiesQueryHandler(IApplicationDbContext context) : IRequestHandler<GetPropertiesQuery, List<PropertyDto>>
    {
        public async Task<List<PropertyDto>> Handle(GetPropertiesQuery request, CancellationToken cancellationToken)
        {
            var query = context.Properties
                .Where(p => p.IsActive && !p.IsDeleted)
                .Include(p => p.Images)
                .Include(p => p.Seller)
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.City))
            {
                query = query.Where(p => p.Address.City.ToLower().Contains(request.City.ToLower()));
            }

            var properties = await query.Select(p => new PropertyDto
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
                Seller = p.Seller != null ? new RealEstate.Application.Admin.Dto.SellerDto
                {
                    Id = p.Seller.Id,
                    Name = p.Seller.Name,
                    Email = p.Seller.Email,
                    IsApproved = p.Seller.IsApproved,
                    ProfilePic = p.Seller.ProfilePic
                } : null!
            }).ToListAsync(cancellationToken);

            return properties;
        }
    }
}
