using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using RealEstate.Application.Property.Dto;

namespace RealEstate.Application.Property.Commands
{
    public record AddPropertyCommand : IRequest<AddPropertyResponse>
    {
        public string Title { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public string City { get; init; } = string.Empty;
        public string Area { get; init; } = string.Empty;
        public string Pincode { get; init; } = string.Empty;
        public PropertyType PropertyType { get; init; }
        public string? Bhk { get; init; }
        public int? Bathrooms { get; init; }
        public decimal? AreaSize { get; init; }
        public Furnishing? Furnishing { get; init; }
        public PropertyStatus Status { get; init; } = PropertyStatus.Sale;
        public List<string> Amenities { get; init; } = [];
        public decimal? Latitude { get; init; }
        public decimal? Longitude { get; set; }
        public List<PropertyImageUpload> Images { get; init; } = [];
    }

    public record PropertyImageUpload(Stream Stream, string FileName);

    public record AddPropertyResponse
    {
        public bool Success { get; init; }
        public PropertyDto Property { get; init; } = null!;
    }



    public class AddPropertyCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService,
        IGlobalNotificationService globalNotificationService)
        : IRequestHandler<AddPropertyCommand, AddPropertyResponse>
    {
        public async Task<AddPropertyResponse> Handle(
            AddPropertyCommand request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var imageUrls = new List<string>();

            foreach (var image in request.Images)
            {
                // TODO: switch to Azure Blob Storage implementation later
                var url = await fileStorageService.UploadAsync(
                    image.Stream,
                    image.FileName,
                    "RealState",
                    ct);

                imageUrls.Add(url);
            }

            if (imageUrls.Count == 0)
            {
                // Fallback UI avatar if no images are provided
                imageUrls.Add($"https://ui-avatars.com/api/?name={Uri.EscapeDataString(request.Title)}&background=random&size=512");
            }

            var property = new Domain.Entities.Property
            {
                Title = request.Title,
                Description = request.Description,
                Price = request.Price,
                Address = new Domain.ValueObjects.Address(request.Area, request.City, "", request.Pincode),
                PropertyType = request.PropertyType,
                Bhk = request.Bhk,
                Bathrooms = request.Bathrooms,
                AreaSize = request.AreaSize,
                Furnishing = request.Furnishing,
                Status = request.Status,
                Amenities = request.Amenities,
                SellerId = currentUser.UserId.Value,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Images = imageUrls
                    .Select(url => new Domain.Entities.PropertyImage { Url = url })
                    .ToList()
            };

            await dbContext.Properties.AddAsync(property);
            await dbContext.SaveChangesAsync(ct);

            // Fetch the seller to get their name
            var seller = await dbContext.Users.FindAsync(new object[] { currentUser.UserId.Value }, ct);
            string sellerName = seller?.Name ?? "A seller";

            // Notify all admins about the new property
            var adminIds = await dbContext.Users
                .Where(u => u.Role == UserRole.Admin && !u.IsDeleted)
                .Select(u => u.Id)
                .ToListAsync(ct);

            foreach (var adminId in adminIds)
            {
                await globalNotificationService.SendNotificationAsync(
                    adminId,
                    "New Property Needs Review",
                    $"{sellerName} added a new property: {property.Title}",
                    "info"
                );
            }

            return new AddPropertyResponse
            {
                Success = true,
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
                    Latitude = property.Latitude,
                    Longitude = property.Longitude,
                    Images = property.Images.Select(i => i.Url).ToList(),
                    SellerId = property.SellerId
                }
            };
        }
    }
}
