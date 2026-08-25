using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{
    public class Token
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Value { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset ExpiresAt { get; set; }

        public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;
    }
}
