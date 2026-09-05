using Microsoft.AspNetCore.Http;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;

namespace RealEstate.API.Dto
{
    public class UpdatePropertyRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? City { get; set; }
        public string? Area { get; set; }
        public string? Pincode { get; set; }
        public PropertyType? PropertyType { get; set; }
        public string? Bhk { get; set; }
        public int? Bathrooms { get; set; }
        public decimal? AreaSize { get; set; }
        public Furnishing? Furnishing { get; set; }
        public PropertyStatus? Status { get; set; }
        public string? Amenities { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? ExistingImages { get; set; }
        public IFormFileCollection? Images { get; set; }
    }
}
