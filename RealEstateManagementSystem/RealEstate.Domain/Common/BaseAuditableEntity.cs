using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Common
{
    public abstract class BaseAuditableEntity : BaseEntity
    {

        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }

        public bool IsDeleted { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }
}
