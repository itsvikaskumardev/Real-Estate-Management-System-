using System;

namespace RealEstate.Application.Property.Dto
{
    public class ReviewDto
    {
        public Guid Id { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public Guid PropertyId { get; set; }
        public Guid BuyerId { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string? BuyerProfilePic { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
