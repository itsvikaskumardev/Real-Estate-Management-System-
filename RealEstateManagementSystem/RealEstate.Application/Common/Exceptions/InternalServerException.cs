using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Exceptions
{
    public class InternalServerException(string message) : Exception(message);
}
