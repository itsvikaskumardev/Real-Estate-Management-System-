using RealEstate.Application.Admin.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Dto
{
    public record ChatDto
    {
        public Guid Id { get; init; }
        public DateTimeOffset UpdatedAt { get; init; }
        public BuyerDto Buyer { get; init; } = null!;
        public SellerDto Seller { get; init; } = null!;
        public ChatPropertyDto? Property { get; init; }
    }

    public record ChatPropertyDto
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public List<string> Images { get; init; } = [];
    }
}
