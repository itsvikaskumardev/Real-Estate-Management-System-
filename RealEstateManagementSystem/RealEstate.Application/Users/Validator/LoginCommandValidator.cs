using FluentValidation;
using RealEstate.Application.Users.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Users.Validator
{

    public class LoginCommandValidator : AbstractValidator<LoginCommand>
    {
        public LoginCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Password)
                .NotEmpty();
        }
    }
}
