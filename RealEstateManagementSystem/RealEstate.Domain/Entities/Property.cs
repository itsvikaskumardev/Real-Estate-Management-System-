using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;
using RealEstate.Domain.ValueObjects;
using System.Collections.Generic;

namespace RealEstate.Domain.Entities
{
    public class Property : BaseAuditableEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        
        public Address Address { get; set; } = null!;

        public PropertyType PropertyType { get; set; }
        public string? Bhk { get; set; }
        public int? Bathrooms { get; set; }
        public decimal? AreaSize { get; set; }
        public Furnishing? Furnishing { get; set; }
        public PropertyStatus Status { get; set; } = PropertyStatus.Sale;
        public bool IsVerified { get; set; } = false;
        public int Views { get; set; } = 0;

        public Guid SellerId { get; set; }
        public User Seller { get; set; } = null!;

        public List<string> Amenities { get; set; } = [];
        public List<string> ViewedBy { get; set; } = [];

        public List<PropertyImage> Images { get; set; } = [];
        public List<Review> Reviews { get; set; } = [];
    }
}
