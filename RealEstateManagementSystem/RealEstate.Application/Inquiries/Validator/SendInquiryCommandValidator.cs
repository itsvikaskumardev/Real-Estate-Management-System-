using FluentValidation;
using RealEstate.Application.Inquiries.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Inquiries.Validator
{

    public class SendInquiryCommandValidator : AbstractValidator<SendInquiryCommand>
    {
        public SendInquiryCommandValidator()
        {
            RuleFor(x => x.PropertyId)
                .NotEmpty();

            RuleFor(x => x.Message)
                .NotEmpty()
                .MaximumLength(2000);
        }
    }
}
