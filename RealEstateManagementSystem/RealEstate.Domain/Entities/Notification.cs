using RealEstate.Domain.Common;
using System;

namespace RealEstate.Domain.Entities
{
    public class Notification : BaseAuditableEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        // e.g., "info", "success", "alert", "warning"
        public string Type { get; set; } = "info";
        
        public bool IsRead { get; set; } = false;
        
        // Optional link to a related entity
        public Guid? RelatedEntityId { get; set; }
    }
}
