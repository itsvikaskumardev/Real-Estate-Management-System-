
using RealEstate.API.Extensions;


var builder = WebApplication.CreateBuilder(args);

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

app.UseRealEstateApplication();

app.Run();