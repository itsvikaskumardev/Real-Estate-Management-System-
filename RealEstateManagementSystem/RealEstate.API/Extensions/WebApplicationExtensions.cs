using RealEstate.API.Middleware;
using RealEstate.API.Endpoints;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

namespace RealEstate.API.Extensions
{
    public static class WebApplicationExtensions
    {
        public static WebApplication UseRealEstateApplication(
            this WebApplication app)
        {
            app.UseMiddleware<ExceptionHandlingMiddleware>();

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapPropertyEndpoints();
            app.MapAuthEndpoints();
            app.MapUserEndpoints();
            app.MapAdminEndpoints();
            app.MapWishlistEndpoints();
            app.MapInquiryEndpoints();
            app.MapChatEndpoints();
            app.MapContactEndpoints();


            return app;
        }
    }
}
