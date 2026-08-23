using Microsoft.EntityFrameworkCore;
using RealEstate.API.Endpoints;
using RealEstate.API.Extensions;
using RealEstate.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddInfrastructure(
    builder.Configuration);

builder.Services.AddRealEstateServices(
    builder.Configuration);
// OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapPropertyEndpoints();
app.MapInquiryEndpoints();

app.MapUserEndpoints();
app.UseHttpsRedirection();

app.Run();