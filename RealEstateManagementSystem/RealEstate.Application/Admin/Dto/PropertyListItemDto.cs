using RealEstate.Application.Admin.Queries;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Dto
{
    public record PropertyListItemDto
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public string City { get; init; } = string.Empty;
        public string PropertyType { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
        public bool IsVerified { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
        public SellerDto Seller { get; init; } = null!;
    }
}
