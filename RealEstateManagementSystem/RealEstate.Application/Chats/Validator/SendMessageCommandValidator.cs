using FluentValidation;
using RealEstate.Application.Chats.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Chats.Validator
{
    public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
    {
        public SendMessageCommandValidator()
        {
            RuleFor(x => x.ChatId)
                .NotEmpty();

            RuleFor(x => x.Text)
                .NotEmpty()
                .MaximumLength(4000);
        }
    }
}
