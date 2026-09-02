using RealEstate.Domain.Common;
using System;

namespace RealEstate.Domain.Entities
{
    public class Document : BaseAuditableEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // e.g., "Aadhaar Card", "PAN Card"
        public string DocumentType { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;

        // NotUploaded, Uploaded, UnderReview, Verified, Rejected
        public string Status { get; set; } = "NotUploaded";

        public DateTimeOffset? VerifiedAt { get; set; }
        public Guid? VerifiedBy { get; set; }
    }
}
