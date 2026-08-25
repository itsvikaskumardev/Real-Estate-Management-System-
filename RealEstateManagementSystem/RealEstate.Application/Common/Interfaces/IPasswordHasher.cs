using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IPasswordHasher
    {
        string Hash(string password);
        bool Verify(string password, string hash);
    }
}
