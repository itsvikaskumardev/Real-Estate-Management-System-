using Microsoft.Extensions.FileSystemGlobbing;
using System.Net;
using System.Runtime.ConstrainedExecution;
using System.Text.Json;

namespace RealEstate.API.Middleware
//This catches unhandled exceptions from your CQRS handlers and returns a consistent API response.
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred.");

                context.Response.StatusCode =
                    (int)HttpStatusCode.InternalServerError;

                context.Response.ContentType = "application/json";

                var response = new
                {
                    success = false,
                    message = "Something went wrong."
                };

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(response));
            }
        }
    }
}
