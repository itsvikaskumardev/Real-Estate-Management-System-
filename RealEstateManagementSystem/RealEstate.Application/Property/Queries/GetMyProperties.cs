using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Property.Dto;

namespace RealEstate.Application.Property.Queries
{
    public record GetMyPropertiesQuery : IRequest<List<PropertyDto>>;


    public class GetMyPropertiesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<GetMyPropertiesQuery, List<PropertyDto>>
    {
        public async Task<List<PropertyDto>> Handle(
            GetMyPropertiesQuery request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var properties = await context.Properties
                .Where(p => p.SellerId == currentUser.UserId)
                .Select(p => new PropertyDto
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
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return properties;
        }
    }
}
