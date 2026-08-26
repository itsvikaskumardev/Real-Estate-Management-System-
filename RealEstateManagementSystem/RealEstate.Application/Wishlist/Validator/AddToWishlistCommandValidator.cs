using FluentValidation;
using RealEstate.Application.Wishlist.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Wishlist.Validator
{
    public class AddToWishlistCommandValidator : AbstractValidator<AddToWishlistCommand>
    {
        public AddToWishlistCommandValidator()
        {
            RuleFor(x => x.PropertyId)
                .NotEmpty();
        }
    }
}
