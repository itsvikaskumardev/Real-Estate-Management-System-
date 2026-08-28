using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using RealEstate.Application.Property.Commands;
using RealEstate.Application.Property.Queries;
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
            group.MapPost("/", async (HttpRequest httpRequest, ISender sender) =>
            {
                var form = await httpRequest.ReadFormAsync();

                var images = form.Files
                    .Where(f => f.Name == "images")
                    .Select(f => new PropertyImageUpload(f.OpenReadStream(), f.FileName))
                    .ToList();

                var command = new AddPropertyCommand
                {
                    Title = form["title"].ToString(),
                    Description = form["description"].ToString(),
                    Price = decimal.Parse(form["price"].ToString()),
                    City = form["city"].ToString(),
                    Area = form["area"].ToString(),
                    Pincode = form["pincode"].ToString(),
                    PropertyType = Enum.Parse<PropertyType>(form["propertyType"].ToString(), ignoreCase: true),
                    Bhk = form["bhk"].ToString() is { Length: > 0 } bhk ? bhk : null,
                    Bathrooms = int.TryParse(form["bathrooms"], out var bathrooms) ? bathrooms : null,
                    AreaSize = decimal.TryParse(form["areaSize"], out var areaSize) ? areaSize : null,
                    Furnishing = Enum.TryParse<Furnishing>(form["furnishing"], ignoreCase: true, out var furnishing)
                        ? furnishing
                        : null,
                    Status = Enum.TryParse<PropertyStatus>(form["status"], ignoreCase: true, out var status)
                        ? status
                        : PropertyStatus.Sale,
                    Amenities = ParseAmenities(form["amenities"].ToString()),
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



            group.MapPut("/{id:Guid}", async (Guid id, HttpRequest httpRequest, ISender sender) =>
            {
                var form = await httpRequest.ReadFormAsync();

                var newImages = form.Files
                    .Where(f => f.Name == "images")
                    .Select(f => new PropertyImageUpload(f.OpenReadStream(), f.FileName))
                    .ToList();

                List<string>? existingImageUrls = null;
                if (form.ContainsKey("existingImages"))
                {
                    existingImageUrls = ParseExistingImages(form["existingImages"].ToString());
                }

                var command = new UpdatePropertyCommand
                {
                    PropertyId = id,
                    Title = form["title"].FirstOrDefault(),
                    Description = form["description"].FirstOrDefault(),
                    Price = decimal.TryParse(form["price"], out var price) ? price : null,
                    City = form["city"].FirstOrDefault(),
                    Area = form["area"].FirstOrDefault(),
                    Pincode = form["pincode"].FirstOrDefault(),
                    PropertyType = Enum.TryParse<Domain.Enums.PropertyType>(form["propertyType"], ignoreCase: true, out var pt)
                        ? pt
                        : null,
                    Bhk = form["bhk"].FirstOrDefault(),
                    Bathrooms = int.TryParse(form["bathrooms"], out var bathrooms) ? bathrooms : null,
                    AreaSize = decimal.TryParse(form["areaSize"], out var areaSize) ? areaSize : null,
                    Furnishing = Enum.TryParse<Domain.Enums.Furnishing>(form["furnishing"], ignoreCase: true, out var furnishing)
                        ? furnishing
                        : null,
                    Status = Enum.TryParse<Domain.Enums.PropertyStatus>(form["status"], ignoreCase: true, out var status)
                        ? status
                        : null,
                    Amenities = form.ContainsKey("amenities") ? ParseAmenities(form["amenities"].ToString()) : null,
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

            //-----

            group.MapGet("/", async ([AsParameters] GetAllPropertiesQuery query, ISender sender) =>
            {
                var result = await sender.Send(query);
                return Results.Ok(new { success = true, result.Count, result.Properties });
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
