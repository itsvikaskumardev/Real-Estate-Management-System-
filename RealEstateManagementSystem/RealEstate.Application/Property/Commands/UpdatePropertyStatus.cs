using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

using RealEstate.Domain.Entities;

namespace RealEstate.Application.Property.Commands
{
    public record UpdatePropertyStatusCommand : IRequest<UpdatePropertyStatusResponse>
    {
        public Guid PropertyId { get; init; }
        public PropertyStatus Status { get; init; }
    }

    public record UpdatePropertyStatusResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public Guid PropertyId { get; init; }
        public string Status { get; init; } = string.Empty;
    }

    public class UpdatePropertyStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<UpdatePropertyStatusCommand, UpdatePropertyStatusResponse>
    {
        public async Task<UpdatePropertyStatusResponse> Handle(
            UpdatePropertyStatusCommand request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var property = await context.Properties
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken);

            if (property is null)
                throw new NotFoundException(nameof(Property), request.PropertyId);

            if (property.SellerId != currentUser.UserId)
                throw new ForbiddenAccessException("Not authorized");

            property.Status = request.Status;

            await context.SaveChangesAsync(cancellationToken);

            return new UpdatePropertyStatusResponse
            {
                Success = true,
                Message = "Property status updated successfully",
                PropertyId = property.Id,
                Status = property.Status.ToString()
            };
        }
    }
}
