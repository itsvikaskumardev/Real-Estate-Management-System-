using FluentValidation;
using RealEstate.Application.Inquiries.Commands;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Inquiries.Validator
{
    public class MarkInquiryAsReadCommandValidator : AbstractValidator<MarkInquiryAsReadCommand>
    {
        public MarkInquiryAsReadCommandValidator()
        {
            RuleFor(x => x.InquiryId)
                .NotEmpty();
        }
    }
}
