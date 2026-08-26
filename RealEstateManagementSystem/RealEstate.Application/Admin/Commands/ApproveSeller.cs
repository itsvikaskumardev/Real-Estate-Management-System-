using MediatR;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Commands
{
    public record ApproveSellerCommand : IRequest<ApproveSellerResponse>
    {
        public Guid SellerId { get; init; }
    }

    public record ApproveSellerResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public SellerDto Seller { get; init; } = null!;
    }



    public class ApproveSellerCommandHandler(IApplicationDbContext context)
        : IRequestHandler<ApproveSellerCommand, ApproveSellerResponse>
    {
        public async Task<ApproveSellerResponse> Handle(
            ApproveSellerCommand request,
            CancellationToken cancellationToken)
        {
            var seller = await context.Users
                .FirstOrDefaultAsync(u => u.Id == request.SellerId, cancellationToken);

            if (seller is null || seller.Role != UserRole.Seller)
                throw new NotFoundException("Seller", request.SellerId);

            seller.IsApproved = true;

            await context.SaveChangesAsync(cancellationToken);

            return new ApproveSellerResponse
            {
                Success = true,
                Message = "Seller approved successfully",
                Seller = new SellerDto
                {
                    Id = seller.Id,
                    Name = seller.Name,
                    Email = seller.Email,
                    IsApproved = seller.IsApproved
                }
            };
        }
    }
}
