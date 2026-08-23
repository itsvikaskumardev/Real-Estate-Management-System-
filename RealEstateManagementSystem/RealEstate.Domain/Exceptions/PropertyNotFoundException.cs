using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Exceptions
{
    public class PropertyNotFoundException : Exception
    {
        public PropertyNotFoundException(Guid propertyId)
            : base($"Property with ID '{propertyId}' was not found.")
        {
        }
    }
}
