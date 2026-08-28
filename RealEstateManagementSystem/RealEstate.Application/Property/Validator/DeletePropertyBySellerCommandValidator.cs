using FluentValidation;
using RealEstate.Application.Property.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Property.Validator
{

    public class DeletePropertyBySellerCommandValidator : AbstractValidator<DeletePropertyBySellerCommand>
    {
        public DeletePropertyBySellerCommandValidator()
        {
            RuleFor(x => x.PropertyId)
                .NotEmpty();
        }
    }
}
