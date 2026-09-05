using Microsoft.AspNetCore.Http;
using RealEstate.Domain.Enums;
using System.Collections.Generic;

namespace RealEstate.API.Dto
{
    public class AddPropertyRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string City { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public PropertyType PropertyType { get; set; }
        public string? Bhk { get; set; }
        public int? Bathrooms { get; set; }
        public decimal? AreaSize { get; set; }
        public Furnishing? Furnishing { get; set; }
        public PropertyStatus Status { get; set; } = PropertyStatus.Sale;
        public string? Amenities { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public IFormFileCollection? Images { get; set; }
    }
}
