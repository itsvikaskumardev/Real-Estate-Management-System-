using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Commands
{
    public record BlockUserCommand : IRequest<BlockUserResponse>
    {
        public Guid UserId { get; init; }
    }

    public record BlockUserResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public bool IsBlocked { get; init; }
    }

    public class BlockUserCommandHandler(IApplicationDbContext dbContext)
        : IRequestHandler<BlockUserCommand, BlockUserResponse>
    {
        public async Task<BlockUserResponse> Handle(
            BlockUserCommand request,
            CancellationToken ct)
        {
            var user = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, ct);

            if (user is null)
                throw new NotFoundException(nameof(User), request.UserId);

            user.IsBlocked = !user.IsBlocked;

            await dbContext.SaveChangesAsync(ct);

            return new BlockUserResponse
            {
                Success = true,
                Message = user.IsBlocked ? "User blocked" : "User unblocked",
                IsBlocked = user.IsBlocked
            };
        }
    }
}
