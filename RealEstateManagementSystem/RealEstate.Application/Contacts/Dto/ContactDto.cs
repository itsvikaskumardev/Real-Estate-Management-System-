using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Contacts.Dto
{
    public record ContactDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? Phone { get; init; }
        public string Role { get; init; } = string.Empty;
        public string Message { get; init; } = string.Empty;
        public DateTimeOffset CreatedAt { get; init; }
    }
}
