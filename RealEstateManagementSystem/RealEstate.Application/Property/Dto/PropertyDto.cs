using System;
using System.Collections.Generic;
using System.Text;
using RealEstate.Application.Admin.Dto;


namespace RealEstate.Application.Property.Dto
{
    public record PropertyDto
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public string City { get; init; } = string.Empty;
        public string Area { get; init; } = string.Empty;
        public string PropertyType { get; init; } = string.Empty;
        public string? Bhk { get; init; }
        public int? Bathrooms { get; init; }
        public decimal? AreaSize { get; init; }
        public string Status { get; init; } = string.Empty;
        public decimal? Latitude { get; init; }
        public decimal? Longitude { get; init; }
        public List<string> Images { get; init; } = [];


        public string Pincode { get; init; } = string.Empty;
        public string? Furnishing { get; init; }
        public List<string> Amenities { get; init; } = [];
        public Guid SellerId { get; init; }
        public bool IsVerified { get; init; }
        public int Views { get; init; }
        public DateTimeOffset CreatedAt { get; init; }

        ///
        public SellerDto Seller { get; init; } = null!;

    }
}
