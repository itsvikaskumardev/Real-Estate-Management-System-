using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
    }
}
