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

            services.AddInfrastructure(configuration);

            services.AddHttpContextAccessor();
            // DbContext
            // Repositories
            // JWT
            // File storage
            // Email service

            return services;
        }
    }
}
