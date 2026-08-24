using RealEstate.API.Middleware;

namespace RealEstate.API.Extensions
{
    public static class WebApplicationExtensions
    {
        public static WebApplication UseRealEstateApplication(
            this WebApplication app)
        {
            app.UseMiddleware<ExceptionHandlingMiddleware>();

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            return app;
        }
    }
}
