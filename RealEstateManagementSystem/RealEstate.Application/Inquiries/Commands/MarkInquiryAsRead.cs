using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Inquiries.Commands
{
    public record MarkInquiryAsReadCommand : IRequest<MarkInquiryAsReadResponse>
    {
        public Guid InquiryId { get; init; }
    }

    public record MarkInquiryAsReadResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public class MarkInquiryAsReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<MarkInquiryAsReadCommand, MarkInquiryAsReadResponse>
    {
        public async Task<MarkInquiryAsReadResponse> Handle(
            MarkInquiryAsReadCommand request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var inquiry = await context.Inquiries
                .FirstOrDefaultAsync(i => i.Id == request.InquiryId, cancellationToken);

            if (inquiry is null)
                throw new NotFoundException(nameof(Inquiry), request.InquiryId);

            if (inquiry.SellerId != currentUser.UserId)
                throw new ForbiddenAccessException("You are not authorized to update this inquiry");

            inquiry.IsRead = true;

            await context.SaveChangesAsync(cancellationToken);

            return new MarkInquiryAsReadResponse
            {
                Success = true,
                Message = "Marked as read"
            };
        }
    }
}
