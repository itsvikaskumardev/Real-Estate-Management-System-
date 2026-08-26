using FluentValidation;
using RealEstate.Application.Contacts.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Contacts.Validator
{
    public class CreateContactCommandValidator : AbstractValidator<CreateContactCommand>
    {
        public CreateContactCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Phone)
                .MaximumLength(20);

            RuleFor(x => x.Role)
                .IsInEnum();

            RuleFor(x => x.Message)
                .NotEmpty()
                .MaximumLength(2000);
        }
    }
}
