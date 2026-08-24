using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{
    public class Contact : BaseAuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public ContactRole Role { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
