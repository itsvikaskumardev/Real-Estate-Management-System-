using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace RealEstate.Application.Common.Behaviors
{
    public class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
    {
        private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

        public LoggingBehavior(
            ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation(
                "Handling {RequestName}",
                typeof(TRequest).Name);

            var response = await next();

            _logger.LogInformation(
                "Handled {RequestName}",
                typeof(TRequest).Name);

            return response;
        }
    }
}

/*
 
 So if the user creates a property, you'll see something like:

Handling CreatePropertyCommand
Handled CreatePropertyCommand
 */