using RealEstate.Domain.Common;
using System;

namespace RealEstate.Domain.Entities
{
    public class SavedSearch : BaseAuditableEntity
    {
        public Guid BuyerId { get; set; }
        public User Buyer { get; set; } = null!;

        // Search Criteria Fields
        public string Title { get; set; } = null!; // e.g. "3 BHK in Mumbai under 1Cr"
        public string? City { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? Bhk { get; set; }
        public string? PropertyType { get; set; }
        public string? Status { get; set; } // "Sale" or "Rent"
        
        public bool EmailAlertsEnabled { get; set; } = true;
    }
}
