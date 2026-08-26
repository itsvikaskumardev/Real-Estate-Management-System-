using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using RealEstate.Application.Inquiries.Dto;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Inquiries.Commands
{
    public record SendInquiryCommand : IRequest<SendInquiryResponse>
    {
        public Guid PropertyId { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public record SendInquiryResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public InquiryDto Inquiry { get; init; } = null!;
    }

   

    public class SendInquiryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<SendInquiryCommand, SendInquiryResponse>
    {
        public async Task<SendInquiryResponse> Handle(
            SendInquiryCommand request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var property = await context.Properties
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken);

            if (property is null)
                throw new NotFoundException(nameof(Property), request.PropertyId);

            var inquiry = new Domain.Entities.Inquiry
            {
                PropertyId = property.Id,
                BuyerId = currentUser.UserId.Value,
                SellerId = property.SellerId,
                Message = request.Message
            };

            context.Inquiries.Add(inquiry);
            await context.SaveChangesAsync(cancellationToken);

            return new SendInquiryResponse
            {
                Success = true,
                Message = "Inquiry sent successfully",
                Inquiry = new InquiryDto
                {
                    Id = inquiry.Id,
                    PropertyId = inquiry.PropertyId,
                    BuyerId = inquiry.BuyerId,
                    SellerId = inquiry.SellerId,
                    Message = inquiry.Message,
                    CreatedAt = inquiry.CreatedAt
                }
            };
        }
    }
}
