using RealEstate.Application.Admin.Queries;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Dto
{
    public record InquiryListItemDto
    {
        public Guid Id { get; init; }
        public string Message { get; init; } = string.Empty;
        public bool IsRead { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
        public BuyerDto Buyer { get; init; } = null!;
        public SellerDto Seller { get; init; } = null!;
        public RealEstate.Application.Property.Dto.PropertyDto Property { get; init; } = null!;
    }
}
