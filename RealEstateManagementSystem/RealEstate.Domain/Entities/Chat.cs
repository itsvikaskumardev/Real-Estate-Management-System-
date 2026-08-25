using RealEstate.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{
    public class Chat : BaseAuditableEntity
    {
        public Guid? PropertyId { get; set; }
        public Property? Property { get; set; }

        public Guid BuyerId { get; set; }
        public User Buyer { get; set; } = null!;

        public Guid SellerId { get; set; }
        public User Seller { get; set; } = null!;

        public List<ChatMessage> Messages { get; set; } = [];
    }
}
