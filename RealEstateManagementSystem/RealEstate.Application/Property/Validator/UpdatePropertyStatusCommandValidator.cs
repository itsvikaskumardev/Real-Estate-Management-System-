using FluentValidation;
using RealEstate.Application.Property.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Property.Validator
{
    public class UpdatePropertyStatusCommandValidator : AbstractValidator<UpdatePropertyStatusCommand>
    {
        public UpdatePropertyStatusCommandValidator()
        {
            RuleFor(x => x.PropertyId)
                .NotEmpty();

            RuleFor(x => x.Status)
                .IsInEnum();
        }
    }
}
