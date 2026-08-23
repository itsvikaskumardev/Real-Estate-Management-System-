using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace RealEstate.Infrastructure.Identity
{
    public class JwtTokenService
    {
        private readonly JwtOptions _options;

        public JwtTokenService(JwtOptions options)
        {
            _options = options;
        }

        public string GenerateToken(Guid userId, string email, string role)
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_options.SecretKey));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    _options.ExpirationMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
