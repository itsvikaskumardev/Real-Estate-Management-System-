using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Dto
{
    public record UserListItemDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
        public string? Phone { get; init; }
        public bool IsBlocked { get; init; }
        public bool IsApproved { get; init; }
        public bool IsVerified { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
    }
}
