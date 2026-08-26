using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Infrastructure.Services
{
    public class DateTimeProvider : IDateTimeProvider
    {
        public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
    }
}
