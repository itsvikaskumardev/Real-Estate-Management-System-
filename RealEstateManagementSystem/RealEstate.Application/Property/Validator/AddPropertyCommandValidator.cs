using FluentValidation;
using RealEstate.Application.Property.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Property.Validator
{
    public class AddPropertyCommandValidator : AbstractValidator<AddPropertyCommand>
    {
        public AddPropertyCommandValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.Description)
                .NotEmpty();

            RuleFor(x => x.Price)
                .GreaterThan(0);

            RuleFor(x => x.City)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Area)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Pincode)
                .NotEmpty()
                .MaximumLength(10);

            RuleFor(x => x.PropertyType)
                .IsInEnum();

            RuleFor(x => x.Furnishing)
                .IsInEnum()
                .When(x => x.Furnishing is not null);

            RuleFor(x => x.Status)
                .IsInEnum();

            RuleFor(x => x.Bathrooms)
                .GreaterThan(0)
                .When(x => x.Bathrooms is not null);

            RuleFor(x => x.AreaSize)
                .GreaterThan(0)
                .When(x => x.AreaSize is not null);
        }
    }
}
