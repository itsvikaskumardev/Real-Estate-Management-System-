using FluentValidation;
using RealEstate.Application.Users.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Users.Validator
{

    public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
    {
        public UpdateProfileCommandValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(200)
                .When(x => x.Name is not null);

            RuleFor(x => x.Phone)
                .MaximumLength(20)
                .When(x => x.Phone is not null);

            RuleFor(x => x.Address)
                .MaximumLength(500)
                .When(x => x.Address is not null);
        }
    }
}
