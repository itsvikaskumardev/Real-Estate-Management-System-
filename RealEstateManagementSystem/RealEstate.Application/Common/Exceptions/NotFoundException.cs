using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Exceptions
{
    public class NotFoundException(string name, object key)
     : Exception($"Entity \"{name}\" ({key}) was not found.");
}
