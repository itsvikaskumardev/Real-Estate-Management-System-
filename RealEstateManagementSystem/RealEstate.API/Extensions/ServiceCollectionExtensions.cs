using RealEstate.Application;
using RealEstate.Infrastructure;

namespace RealEstate.API.Extensions
/*
 So ServiceCollectionExtensions.cs doesn't contain your business logic. 
It is just a clean place to organize Dependency Injection registrations.
 */

{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddRealEstateServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddApplication();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            services.AddInfrastructure(configuration);

            services.AddExceptionHandler<Middleware.GlobalExceptionHandler>();
            services.AddProblemDetails();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => 
                    policy.RequireRole("admin", "Admin"));
            });

            services.AddHttpContextAccessor();
            
            // Configure JSON to parse Enums from strings
            services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
            {
                options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });

            // DbContext
            // Repositories
            // JWT
            // File storage
            // Email service

            return services;
        }
    }
}
