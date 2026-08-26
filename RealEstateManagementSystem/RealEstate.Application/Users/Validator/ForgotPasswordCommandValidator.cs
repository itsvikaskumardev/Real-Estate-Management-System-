using FluentValidation;
using RealEstate.Application.Users.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Users.Validator
{
    public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
    {
        public ForgotPasswordCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();
        }
    }
}
