using FluentValidation;
using RealEstate.Application.Chats.Queries;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Validator
{
    public class GetChatByIdQueryValidator : AbstractValidator<GetChatByIdQuery>
    {
        public GetChatByIdQueryValidator()
        {
            RuleFor(x => x.ChatId)
                .NotEmpty();
        }
    }
}
