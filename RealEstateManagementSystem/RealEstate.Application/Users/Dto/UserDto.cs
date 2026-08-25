using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Users.Dto
{
    public record UserDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
    }
}
