using RealEstate.Application;
using RealEstate.Infrastructure;
using RealEstate.Application.Common.Interfaces;
using RealEstate.API.Services;

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
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173")//Only this frontend origin is allowed.
                          .AllowAnyHeader()// Allow request headers such as Content-Type, Authorization, etc.
                          .AllowAnyMethod()// GET POST PUT DELETE 
                          .AllowCredentials();
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
            services.AddSignalR();
            services.AddScoped<IChatNotificationService, ChatNotificationService>();
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
