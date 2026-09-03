using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using RealEstate.API.Dto;
using RealEstate.Application.Property.Commands;
using RealEstate.Application.Property.Queries;
using RealEstate.Application.Analytics.Queries;
using RealEstate.Domain.Enums;
using System;
using System.Linq;
using System.Text.Json;

namespace RealEstate.API.Endpoints
{
    public static class PropertyEndpoints
    {
        public static void MapPropertyEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/property")
                .WithTags("Property");

            group.MapGet("/counts", async ([FromServices] ISender sender) =>
            {
                var counts = await sender.Send(new GetPropertyCountsQuery());
                return Results.Ok(new { success = true, counts });
            }).WithName("GetPropertyCounts");


            //------------------------
            group.MapPost("/", async ([FromForm] AddPropertyRequest request, ISender sender) =>
            {
                var images = request.Images?
                    .Select(f => new PropertyImageUpload(f.OpenReadStream(), f.FileName))
                    .ToList() ?? new List<PropertyImageUpload>();

                var command = new AddPropertyCommand
                {
                    Title = request.Title,
                    Description = request.Description,
                    Price = request.Price,
                    City = request.City,
                    Area = request.Area,
                    Pincode = request.Pincode,
                    PropertyType = request.PropertyType,
                    Bhk = request.Bhk,
                    Bathrooms = request.Bathrooms,
                    AreaSize = request.AreaSize,
                    Furnishing = request.Furnishing,
                    Status = request.Status,
                    Amenities = ParseAmenities(request.Amenities ?? ""),
                    Images = images
                };

                var result = await sender.Send(command);
                return Results.Ok(result);
            })
           .RequireAuthorization()
           .DisableAntiforgery()
           .WithName("AddProperty");

            //------------------------


            group.MapGet("/my", async (ISender sender) =>
            {
                var result = await sender.Send(new GetMyPropertiesQuery());
                return Results.Ok(new { success = true, properties = result });
            })
            .RequireAuthorization()
            .WithName("GetMyProperties");

            //------------------------



            group.MapPut("/{id:Guid}", async (Guid id, [FromForm] UpdatePropertyRequest request, ISender sender) =>
            {
                var newImages = request.Images?
                    .Select(f => new PropertyImageUpload(f.OpenReadStream(), f.FileName))
                    .ToList();

                List<string>? existingImageUrls = null;
                if (!string.IsNullOrEmpty(request.ExistingImages))
                {
                    existingImageUrls = ParseExistingImages(request.ExistingImages);
                }

                var command = new UpdatePropertyCommand
                {
                    PropertyId = id,
                    Title = request.Title,
                    Description = request.Description,
                    Price = request.Price,
                    City = request.City,
                    Area = request.Area,
                    Pincode = request.Pincode,
                    PropertyType = request.PropertyType,
                    Bhk = request.Bhk,
                    Bathrooms = request.Bathrooms,
                    AreaSize = request.AreaSize,
                    Furnishing = request.Furnishing,
                    Status = request.Status,
                    Amenities = !string.IsNullOrEmpty(request.Amenities) ? ParseAmenities(request.Amenities) : null,
                    ExistingImageUrls = existingImageUrls,
                    NewImages = newImages
                };

                var result = await sender.Send(command);
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .DisableAntiforgery()
            .WithName("UpdateProperty");


            //------------------------


            group.MapDelete("/{id:Guid}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new DeletePropertyBySellerCommand { PropertyId = id });
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .WithName("DeletePropertyBySeller");


            group.MapPatch("/{id:Guid}/status", async (Guid id, UpdatePropertyStatusRequestBody body, ISender sender) =>
            {
                var result = await sender.Send(new UpdatePropertyStatusCommand
                {
                    PropertyId = id,
                    Status = body.Status
                });
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .WithName("UpdatePropertyStatus");


            group.MapGet("/", async ([AsParameters] GetAllPropertiesQuery query, ISender sender) =>
            {
                var result = await sender.Send(query);
                return Results.Ok(new 
                { 
                    success = true, 
                    count = result.TotalCount, 
                    properties = result.Items,
                    pageNumber = result.PageNumber,
                    pageSize = result.PageSize,
                    totalPages = result.TotalPages
                });
            })
            .WithName("GetProperties");


            group.MapGet("/{id:Guid}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new GetPropertyDetailsQuery { PropertyId = id });
                return Results.Ok(new { success = true, result.Property, result.SimilarProperties });
            })
            .WithName("GetPropertyDetails");


            group.MapGet("/seller/dashboard", async (ISender sender) =>
            {
                var result = await sender.Send(new GetSellerDashboardQuery());
                return Results.Ok(new { success = true, stats = result });
            })
            .RequireAuthorization()
            .WithName("GetSellerDashboard");

            group.MapGet("/seller/analytics", async (ISender sender) =>
            {
                var result = await sender.Send(new GetSellerAnalyticsQuery());
                return Results.Ok(new { success = true, data = result });
            })
            .RequireAuthorization(policy => policy.RequireRole("seller", "Seller"))
            .WithName("GetSellerAnalytics");




        }





        private static List<string> ParseAmenities(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return [];

            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(raw);
                if (parsed is not null)
                    return parsed;
            }
            catch (JsonException)
            {
                // fall through to comma-split
            }

            return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
        }

        static List<string> ParseExistingImages(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return [];
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<string>>(raw) ?? [];
            }
            catch (System.Text.Json.JsonException)
            {
                return [];
            }
        }

    }

    public record UpdatePropertyStatusRequestBody(PropertyStatus Status);
}
