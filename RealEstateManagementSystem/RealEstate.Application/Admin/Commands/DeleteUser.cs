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
    public record DeleteUserCommand : IRequest<DeleteUserResponse>
    {
        public Guid UserId { get; init; }
    }

    public record DeleteUserResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public class DeleteUserCommandHandler(IApplicationDbContext dbContext)
        : IRequestHandler<DeleteUserCommand, DeleteUserResponse>
    {
        public async Task<DeleteUserResponse> Handle(
            DeleteUserCommand request,
            CancellationToken ct)
        {
            var user = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId && u.IsActive && !u.IsDeleted, ct);

            if (user is null)
                throw new NotFoundException(nameof(User), request.UserId);

            user.IsDeleted = true;
            user.IsActive = false;
            await dbContext.SaveChangesAsync(ct);

            return new DeleteUserResponse
            {
                Success = true,
                Message = "User deleted"
            };
        }
    }
}
