using FluentValidation;
using RealEstate.Application.Property.Queries;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Property.Validator
{
    public class GetPropertyDetailsQueryValidator : AbstractValidator<GetPropertyDetailsQuery>
    {
        public GetPropertyDetailsQueryValidator()
        {
            RuleFor(x => x.PropertyId)
                .NotEmpty();
        }
    }
}
