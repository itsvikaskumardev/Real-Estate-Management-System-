using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Inquiries.Queries;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Inquiries.Dto
{
    public record SellerInquiryDto
    {
        public Guid Id { get; init; }
        public string Message { get; init; } = string.Empty;
        public bool IsRead { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
        public BuyerDto Buyer { get; init; } = null!;
        public PropertySummaryDto Property { get; init; } = null!;
    }
}
