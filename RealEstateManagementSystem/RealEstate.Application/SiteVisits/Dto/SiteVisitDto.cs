using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.SiteVisits.Dto
{
    public class SiteVisitDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyTitle { get; set; } = null!;
        public string PropertyImage { get; set; } = null!;
        public Guid BuyerId { get; set; }
        public string BuyerName { get; set; } = null!;
        public string BuyerEmail { get; set; } = null!;
        public Guid SellerId { get; set; }
        public string SellerName { get; set; } = null!;
        public string SellerEmail { get; set; } = null!;
        public DateTime VisitDate { get; set; }
        public string Status { get; set; } = null!;
        public string? Message { get; set; }
    }
}
