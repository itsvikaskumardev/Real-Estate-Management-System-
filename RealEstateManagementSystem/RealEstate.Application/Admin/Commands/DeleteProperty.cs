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

    public class DeletePropertyCommandHandler(IApplicationDbContext context)
        : IRequestHandler<DeletePropertyCommand, DeletePropertyResponse>
    {
        public async Task<DeletePropertyResponse> Handle(
            DeletePropertyCommand request,
            CancellationToken cancellationToken)
        {
            var property = await context.Properties
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken);

            if (property is null)
                throw new NotFoundException(nameof(Property), request.PropertyId);

            context.Properties.Remove(property);
            await context.SaveChangesAsync(cancellationToken);

            return new DeletePropertyResponse
            {
                Success = true,
                Message = "Property deleted"
            };
        }
    }
}
