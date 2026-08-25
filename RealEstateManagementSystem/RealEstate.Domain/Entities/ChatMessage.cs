using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{

    public class ChatMessage
    {
        public Guid Id { get; set; }

        public Guid ChatId { get; set; }
        public Chat Chat { get; set; } = null!;

        public Guid SenderId { get; set; }
        public User Sender { get; set; } = null!;

        public string Text { get; set; } = string.Empty;
        public string? Image { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
