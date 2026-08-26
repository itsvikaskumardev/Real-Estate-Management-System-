using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Dto
{
    public record ChatMessageDto
    {
        public Guid Id { get; init; }
        public Guid ChatId { get; init; }
        public Guid SenderId { get; init; }
        public string Text { get; init; } = string.Empty;
        public string? Image { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
        public SenderDto? Sender { get; init; }
    }

    public record SenderDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string? ProfilePic { get; init; }
    }
}
