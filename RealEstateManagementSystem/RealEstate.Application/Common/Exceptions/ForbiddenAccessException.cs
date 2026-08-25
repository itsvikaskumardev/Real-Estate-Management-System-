using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Exceptions
{
    public class ForbiddenAccessException(string message) : Exception(message);
}
