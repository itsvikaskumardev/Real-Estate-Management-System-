
using RealEstate.API.Extensions;
using Scalar.AspNetCore;


var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
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
}

app.MapScalarApiReference();

app.UseCors("AllowFrontend");

app.UseRealEstateApplication();

app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));

app.MapGet("/", () => Results.Content(
    "<html><body><h1>Real Estate API is running</h1><p><a href='/scalar'>View API Documentation</a></p></body></html>", 
    "text/html"));

app.Run();