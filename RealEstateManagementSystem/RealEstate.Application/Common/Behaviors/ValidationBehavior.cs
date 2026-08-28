using FluentValidation;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

//Validates commands/queries before they reach the handler.

namespace RealEstate.Application.Common.Behaviors
{
    public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken ct)
        {
            if (_validators.Any())
            {
                var context = new ValidationContext<TRequest>(request);

                var results = await Task.WhenAll(
                    _validators.Select(v => v.ValidateAsync(context, ct)));

                var errors = results
                    .SelectMany(r => r.Errors)
                    .Where(e => e != null)
                    .ToList();

                if (errors.Any())
                    throw new ValidationException(errors);
            }

            return await next();
        }
    }
}


/*
 For example, when creating a property:

CreatePropertyCommand
        ↓
ValidationBehavior
        ↓
CreatePropertyCommandHandler
 
 
 */