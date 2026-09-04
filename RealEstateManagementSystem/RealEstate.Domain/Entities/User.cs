using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{

    public class User : BaseAuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Buyer;
        public string? Phone { get; set; }
        public bool IsBlocked { get; set; } = false;
        public string? ProfilePic { get; set; }
        public string? Address { get; set; }
        public bool IsApproved { get; set; } = true;
        public bool IsVerified { get; set; } = false;
        public string? VerificationToken { get; set; }
        public string? ResetPasswordToken { get; set; }
        public DateTimeOffset? ResetPasswordExpire { get; set; }
        public string OnboardingStatus { get; set; } = "Incomplete";
        
        public List<Review> Reviews { get; set; } = [];
    }
}
