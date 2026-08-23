using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Common
{
    public abstract class BaseAuditableEntity
    {
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}
