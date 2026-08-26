using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Properties.Dto
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
        public List<string> Images { get; init; } = [];
    }
}
