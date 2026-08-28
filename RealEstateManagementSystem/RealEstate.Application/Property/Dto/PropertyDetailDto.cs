using RealEstate.Application.Admin.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Property.Dto
{
    public record PropertyDetailDto
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public string City { get; init; } = string.Empty;
        public string Area { get; init; } = string.Empty;
        public string PropertyType { get; init; } = string.Empty;
        public string? Bhk { get; init; }
        public decimal? AreaSize { get; init; }
        public string Status { get; init; } = string.Empty;
        public int Views { get; init; }
        public List<string> Amenities { get; init; } = [];
        public List<string> Images { get; init; } = [];
        public SellerDto Seller { get; init; } = null!;
    }
}
