using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IDateTimeProvider
    {
        DateTimeOffset UtcNow { get; }
    }
}
