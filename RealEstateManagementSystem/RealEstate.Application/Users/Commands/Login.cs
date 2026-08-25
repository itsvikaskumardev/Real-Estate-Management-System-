using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using RealEstate.Application.Users.Dto;
namespace RealEstate.Application.Users.Commands
{
    public record LoginCommand : IRequest<LoginResponse>
    {
        public string Email { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }

    public record LoginResponse
    {
        public string Message { get; init; } = string.Empty;
        public string Token { get; init; } = string.Empty;
        public UserDto User { get; init; } = null!;
    }



    public class LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
        : IRequestHandler<LoginCommand, LoginResponse>
    {
        public async Task<LoginResponse> Handle(
            LoginCommand request,
            CancellationToken cancellationToken)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

            if (user is null)
                throw new UnauthorizedException("Invalid email or password");

            if (!user.IsVerified)
                throw new ForbiddenAccessException(
                    "Please verify your email before logging in. A code was sent to your email.");

            var isMatch = passwordHasher.Verify(request.Password, user.PasswordHash);
            if (!isMatch)
                throw new UnauthorizedException("Invalid email or password");

            if (user.IsBlocked)
                throw new ForbiddenAccessException(
                    "Your account has been blocked by an admin. Please contact support.");

            var token = jwtTokenService.GenerateToken(user);

            return new LoginResponse
            {
                Message = "Login success",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role.ToString()
                }
            };
        }
    }
}
