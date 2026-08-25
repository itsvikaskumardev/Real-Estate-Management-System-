using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
