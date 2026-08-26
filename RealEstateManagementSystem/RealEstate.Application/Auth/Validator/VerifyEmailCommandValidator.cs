using FluentValidation;
using RealEstate.Application.Auth.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Auth.Validator
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
