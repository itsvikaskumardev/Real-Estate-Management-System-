using MediatR;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using RealEstate.Application.Property.Dto;
namespace RealEstate.Application.Admin.Queries
{
    public record GetAllPropertiesQuery : IRequest<GetAllPropertiesResponse>;

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
            var properties = await dbContext.Properties
                .Where(p => p.IsActive && !p.IsDeleted)
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
