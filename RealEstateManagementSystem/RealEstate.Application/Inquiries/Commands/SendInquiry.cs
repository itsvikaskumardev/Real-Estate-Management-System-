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
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
        : IRequestHandler<SendInquiryCommand, SendInquiryResponse>
    {
        public async Task<SendInquiryResponse> Handle(
            SendInquiryCommand request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var property = await dbContext.Properties
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, ct);

            if (property is null)
                throw new NotFoundException(nameof(Property), request.PropertyId);

            var inquiry = new Domain.Entities.Inquiry
            {
                PropertyId = property.Id,
                BuyerId = currentUser.UserId.Value,
                SellerId = property.SellerId,
                Message = request.Message
            };

            await dbContext.Inquiries.AddAsync(inquiry);
            await dbContext.SaveChangesAsync(ct);

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
