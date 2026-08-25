using Microsoft.AspNetCore.Identity;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Identity
{
    public class PasswordHasher : IPasswordHasher
    {
        private readonly PasswordHasher<object> _hasher = new();
        private readonly object _dummyUser = new();

        public string Hash(string password)
        {
            return _hasher.HashPassword(_dummyUser, password);
        }

        public bool Verify(string password, string hash)
        {
            var result = _hasher.VerifyHashedPassword(_dummyUser, hash, password);
            return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;
        }
    }
}
