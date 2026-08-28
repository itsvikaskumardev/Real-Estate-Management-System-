using MediatR;
using RealEstate.Application.Property.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Property.Commands
{
    public record UpdatePropertyCommand : IRequest<UpdatePropertyResponse>
    {
        public Guid PropertyId { get; init; }
        public string? Title { get; init; }
        public string? Description { get; init; }
        public decimal? Price { get; init; }
        public string? City { get; init; }
        public string? Area { get; init; }
        public string? Pincode { get; init; }
        public PropertyType? PropertyType { get; init; }
        public string? Bhk { get; init; }
        public int? Bathrooms { get; init; }
        public decimal? AreaSize { get; init; }
        public Furnishing? Furnishing { get; init; }
        public PropertyStatus? Status { get; init; }
        public List<string>? Amenities { get; init; }
        public List<string>? ExistingImageUrls { get; init; }
        public List<PropertyImageUpload> NewImages { get; init; } = [];
    }


    public record UpdatePropertyResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public PropertyDto Property { get; init; } = null!;
    }



    public class UpdatePropertyCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService)
        : IRequestHandler<UpdatePropertyCommand, UpdatePropertyResponse>
    {
        public async Task<UpdatePropertyResponse> Handle(
            UpdatePropertyCommand request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var property = await dbContext.Properties
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, ct);

            if (property is null)
                throw new NotFoundException(nameof(Property), request.PropertyId);

            if (property.SellerId != currentUser.UserId)
                throw new ForbiddenAccessException("Not authorized");

            // Update only fields that were actually provided
            if (request.Title is not null) property.Title = request.Title;
            if (request.Description is not null) property.Description = request.Description;
            if (request.Price is not null) property.Price = request.Price.Value;
            if (request.City is not null || request.Area is not null || request.Pincode is not null)
            {
                property.Address = new Domain.ValueObjects.Address(
                    request.Area ?? property.Address.Street,
                    request.City ?? property.Address.City,
                    property.Address.State,
                    request.Pincode ?? property.Address.Pincode
                );
            }
            if (request.PropertyType is not null) property.PropertyType = request.PropertyType.Value;
            if (request.Bhk is not null) property.Bhk = request.Bhk;
            if (request.Bathrooms is not null) property.Bathrooms = request.Bathrooms;
            if (request.AreaSize is not null) property.AreaSize = request.AreaSize;
            if (request.Furnishing is not null) property.Furnishing = request.Furnishing;
            if (request.Status is not null) property.Status = request.Status.Value;
            if (request.Amenities is not null) property.Amenities = request.Amenities;

            // Handle existing image removal — keep only the URLs the client says to keep
            if (request.ExistingImageUrls is not null)
            {
                var toRemove = property.Images
                    .Where(img => !request.ExistingImageUrls.Contains(img.Url))
                    .ToList();

                foreach (var img in toRemove)
                    dbContext.PropertyImages.Remove(img);
            }

            // Upload and append new images
            foreach (var image in request.NewImages)
            {
                // TODO: switch to Azure Blob Storage implementation later
                var url = await fileStorageService.UploadAsync(
                    image.Stream,
                    image.FileName,
                    "properties",
                    ct);

                property.Images.Add(new PropertyImage { Url = url });
            }

            await dbContext.SaveChangesAsync(ct);

            return new UpdatePropertyResponse
            {
                Success = true,
                Message = "Property updated",
                Property = new PropertyDto
                {
                    Id = property.Id,
                    Title = property.Title,
                    Description = property.Description,
                    Price = property.Price,
                    City = property.Address.City,
                    Area = property.Address.Street,
                    Pincode = property.Address.Pincode,
                    PropertyType = property.PropertyType.ToString(),
                    Bhk = property.Bhk,
                    Bathrooms = property.Bathrooms,
                    AreaSize = property.AreaSize,
                    Furnishing = property.Furnishing?.ToString(),
                    Status = property.Status.ToString(),
                    Amenities = property.Amenities,
                    Images = property.Images.Select(i => i.Url).ToList(),
                    SellerId = property.SellerId
                }
            };
        }
    }
}
