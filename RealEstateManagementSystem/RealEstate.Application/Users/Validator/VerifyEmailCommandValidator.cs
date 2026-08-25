using FluentValidation;
using RealEstate.Application.Users.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Users.Validator
{
    public class VerifyEmailCommandValidator : AbstractValidator<VerifyEmailCommand>
    {
        public VerifyEmailCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Code)
                .NotEmpty();
        }
    }
}
