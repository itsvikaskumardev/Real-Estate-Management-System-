using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
namespace RealEstate.Application.Admin.Commands
{

    public record DeletePropertyCommand : IRequest<DeletePropertyResponse>
    {
        public Guid PropertyId { get; init; }
    }

    public record DeletePropertyResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public class DeletePropertyCommandHandler(IApplicationDbContext dbContext)
        : IRequestHandler<DeletePropertyCommand, DeletePropertyResponse>
    {
        public async Task<DeletePropertyResponse> Handle(
            DeletePropertyCommand request,
            CancellationToken ct)
        {
            var property = await dbContext.Properties
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId && p.IsActive && !p.IsDeleted, ct);

            if (property is null)
                throw new NotFoundException(nameof(Property), request.PropertyId);

            property.IsDeleted = true;
            property.IsActive = false;
            await dbContext.SaveChangesAsync(ct);

            return new DeletePropertyResponse
            {
                Success = true,
                Message = "Property deleted"
            };
        }
    }
}
