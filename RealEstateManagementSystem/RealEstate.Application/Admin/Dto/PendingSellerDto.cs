using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Dto
{
    public record PendingSellerDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? Phone { get; init; }
        public string? Address { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
    }
}
