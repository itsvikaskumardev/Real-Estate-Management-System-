using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Auth.Dto
{
    public record UserDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
        public string? Phone { get; init; }
        public string? Address { get; init; }
        public string? ProfilePic { get; init; }
    }
}
