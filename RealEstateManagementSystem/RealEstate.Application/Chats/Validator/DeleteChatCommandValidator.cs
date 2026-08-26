using FluentValidation;
using RealEstate.Application.Chats.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Validator
{
    public class DeleteChatCommandValidator : AbstractValidator<DeleteChatCommand>
    {
        public DeleteChatCommandValidator()
        {
            RuleFor(x => x.ChatId)
                .NotEmpty();
        }
    }
}
