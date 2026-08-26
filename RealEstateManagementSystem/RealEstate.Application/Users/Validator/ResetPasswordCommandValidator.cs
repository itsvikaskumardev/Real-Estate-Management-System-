using FluentValidation;
using RealEstate.Application.Users.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Users.Validator
{

    public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordCommandValidator()
        {
            RuleFor(x => x.Token)
                .NotEmpty();

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(6);
        }
    }
}
