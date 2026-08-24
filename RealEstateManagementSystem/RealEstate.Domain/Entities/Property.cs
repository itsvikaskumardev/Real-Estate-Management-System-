using System;
using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities
{
    public class Property : BaseAuditableEntity
    {
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
