using RealEstate.Domain.Common;
using System;

namespace RealEstate.Domain.Entities
{
    public class Review : BaseAuditableEntity
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        
        public Guid PropertyId { get; set; }
        public Property Property { get; set; } = null!;
        
        public Guid BuyerId { get; set; }
        public User Buyer { get; set; } = null!;
    }
}
