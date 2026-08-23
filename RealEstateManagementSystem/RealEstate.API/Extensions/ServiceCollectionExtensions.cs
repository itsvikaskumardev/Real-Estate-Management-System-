using RealEstate.Application;
using RealEstate.Infrastructure;

namespace RealEstate.API.Extensions
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

            return services;
        }
    }
}
