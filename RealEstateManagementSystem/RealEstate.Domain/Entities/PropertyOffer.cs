using RealEstate.Domain.Common;
using System;

namespace RealEstate.Domain.Entities
{
    public class PropertyOffer : BaseAuditableEntity
    {
        public Guid PropertyId { get; set; }
        public Property Property { get; set; } = null!;

        public Guid BuyerId { get; set; }
        public User Buyer { get; set; } = null!;

        public Guid SellerId { get; set; }
        public User Seller { get; set; } = null!;

        public decimal OfferAmount { get; set; }
        
        public string Message { get; set; } = string.Empty;
        
        // Status: "Pending", "Accepted", "Rejected"
        public string Status { get; set; } = "Pending";
    }
}
