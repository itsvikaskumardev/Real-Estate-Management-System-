using FluentValidation;
using RealEstate.Application.Auth.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Auth.Validator
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
