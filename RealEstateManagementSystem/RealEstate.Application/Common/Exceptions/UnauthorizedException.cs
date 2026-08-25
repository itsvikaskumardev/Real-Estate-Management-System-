using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Exceptions
{
    public class UnauthorizedException(string message) : Exception(message);
}
