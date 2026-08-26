using FluentValidation;
using RealEstate.Application.Auth.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Auth.Validator
{
    public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(6);

            RuleFor(x => x.Role)
                .IsInEnum();
        }
    }
}
