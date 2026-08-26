using FluentValidation;
using RealEstate.Application.Wishlist.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Wishlist.Validator
{
    public class RemoveFromWishlistCommandValidator : AbstractValidator<RemoveFromWishlistCommand>
    {
        public RemoveFromWishlistCommandValidator()
        {
            RuleFor(x => x.PropertyId)
                .NotEmpty();
        }
    }
}
