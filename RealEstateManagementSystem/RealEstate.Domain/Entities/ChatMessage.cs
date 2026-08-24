using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{

    public class ChatMessage
    {
        public int Id { get; set; }

        public int ChatId { get; set; }
        public Chat Chat { get; set; } = null!;

        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;

        public string Text { get; set; } = string.Empty;
        public string? Image { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
