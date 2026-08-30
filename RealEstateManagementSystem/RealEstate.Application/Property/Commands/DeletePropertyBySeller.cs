using MediatR;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using RealEstate.Domain.Entities;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace RealEstate.Application.Property.Commands
{
    public record DeletePropertyBySellerCommand : IRequest<DeletePropertyBySellerResponse>
    {
        public Guid PropertyId { get; init; }
    }

    public record DeletePropertyBySellerResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public class DeletePropertyBySellerCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService,
        ILogger<DeletePropertyBySellerCommandHandler> logger)
        : IRequestHandler<DeletePropertyBySellerCommand, DeletePropertyBySellerResponse>
    {
        public async Task<DeletePropertyBySellerResponse> Handle(
            DeletePropertyBySellerCommand request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var property = await dbContext.Properties
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId && p.IsActive && !p.IsDeleted, ct);

            if (property is null)
                throw new NotFoundException(nameof(Property), request.PropertyId);

            if (property.SellerId != currentUser.UserId)
                throw new ForbiddenAccessException("Not authorized");

            // Delete images from storage — best-effort, don't block the DB delete if one fails
            foreach (var image in property.Images)
            {
                try
                {
                    // TODO: switch to Azure Blob Storage implementation later
                    await fileStorageService.DeleteAsync(image.Url, ct);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to delete image {ImageUrl} for property {PropertyId}", image.Url, property.Id);
                }
            }

            property.IsDeleted = true;
            property.IsActive = false;
            await dbContext.SaveChangesAsync(ct);

            return new DeletePropertyBySellerResponse
            {
                Success = true,
                Message = "Property deleted successfully"
            };
        }
    }
}
