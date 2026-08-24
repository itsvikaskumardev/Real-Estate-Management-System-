using Microsoft.Extensions.DependencyInjection;

namespace RealEstate.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Register MediatR, FluentValidation, etc.
            return services;
        }
    }
}
