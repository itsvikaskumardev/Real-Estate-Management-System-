using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{
    public class Transaction : BaseEntity
    {
        public Guid PropertyId { get; set; }
        public Guid BuyerId { get; set; }
        public Guid SellerId { get; set; }

        public decimal Price { get; set; }
        public decimal AdminCommission { get; set; }
        public decimal SellerRevenue { get; set; }

        public string Status { get; set; } = "Completed"; // "Pending", "Completed", "Failed"

        public Property Property { get; set; } = null!;
        public User Buyer { get; set; } = null!;
        public User Seller { get; set; } = null!;
    }
}
