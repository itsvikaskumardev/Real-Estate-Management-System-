using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace RealEstate.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
            
            // Register FluentValidation, etc.
            return services;
        }
    }
}
