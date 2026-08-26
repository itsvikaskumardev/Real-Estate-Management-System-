using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Inquiries.Dto
{
    public record InquiryDto
    {
        public Guid Id { get; init; }
        public Guid PropertyId { get; init; }
        public Guid BuyerId { get; init; }
        public Guid SellerId { get; init; }
        public string Message { get; init; } = string.Empty;
        public DateTimeOffset CreatedAt { get; init; }
    }
}
