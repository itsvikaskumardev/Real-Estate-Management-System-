using RealEstate.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{
    public class Inquiry : BaseAuditableEntity
    {
        public Guid PropertyId { get; set; }
        public Property Property { get; set; } = null!;

        public Guid BuyerId { get; set; }
        public User Buyer { get; set; } = null!;

        public Guid SellerId { get; set; }
        public User Seller { get; set; } = null!;

        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
    }
}
