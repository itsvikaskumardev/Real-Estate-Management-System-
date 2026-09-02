
using RealEstate.API.Extensions;
using Scalar.AspNetCore;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRealEstateServices(
    builder.Configuration);
// OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler();

// HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowFrontend");

app.UseRealEstateApplication();

app.Run();