using FluentValidation;
using RealEstate.Application.Auth.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Auth.Validator
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
