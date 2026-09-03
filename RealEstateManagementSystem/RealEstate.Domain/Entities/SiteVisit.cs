using RealEstate.Domain.Common;
using System;

namespace RealEstate.Domain.Entities
{
    public class SiteVisit : BaseEntity
    {
        public Guid PropertyId { get; set; }
        public Property Property { get; set; } = null!;

        public Guid BuyerId { get; set; }
        public User Buyer { get; set; } = null!;

        public Guid SellerId { get; set; }
        public User Seller { get; set; } = null!;

        public DateTime VisitDate { get; set; }
        
        // "Pending", "Approved", "Rejected", "Completed"
        public string Status { get; set; } = "Pending";
        
        public string? Message { get; set; }
    }
}
