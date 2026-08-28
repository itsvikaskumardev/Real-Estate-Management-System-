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

    public class DeleteUserCommandHandler(IApplicationDbContext context)
        : IRequestHandler<DeleteUserCommand, DeleteUserResponse>
    {
        public async Task<DeleteUserResponse> Handle(
            DeleteUserCommand request,
            CancellationToken cancellationToken)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId && u.IsActive && !u.IsDeleted, cancellationToken);

            if (user is null)
                throw new NotFoundException(nameof(User), request.UserId);

            user.IsDeleted = true;
            user.IsActive = false;
            await context.SaveChangesAsync(cancellationToken);

            return new DeleteUserResponse
            {
                Success = true,
                Message = "User deleted"
            };
        }
    }
}
