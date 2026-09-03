using MediatR;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Inquiries.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Inquiries.Queries
{
    public record GetBuyerInquiriesQuery : IRequest<GetBuyerInquiriesResponse>;

    public record GetBuyerInquiriesResponse
    {
        public int Count { get; init; }
        public List<BuyerInquiryDto> Inquiries { get; init; } = new();
    }

    public record BuyerInquiryDto
    {
        public Guid Id { get; init; }
        public string Message { get; init; } = string.Empty;
        public bool IsRead { get; init; }
        public DateTime CreatedAt { get; init; }
        public PropertySummaryDto Property { get; init; } = default!;
    }

    public class GetBuyerInquiriesQueryHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
        : IRequestHandler<GetBuyerInquiriesQuery, GetBuyerInquiriesResponse>
    {
        public async Task<GetBuyerInquiriesResponse> Handle(
            GetBuyerInquiriesQuery request,
            CancellationToken ct)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var inquiries = await dbContext.Inquiries
                .Where(i => i.BuyerId == currentUser.UserId && i.IsActive && !i.IsDeleted)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new BuyerInquiryDto
                {
                    Id = i.Id,
                    Message = i.Message,
                    IsRead = i.IsRead,
                    CreatedAt = i.CreatedAt,
                    Property = new PropertySummaryDto
                    {
                        Id = i.Property.Id,
                        Title = i.Property.Title,
                        Price = i.Property.Price,
                        City = i.Property.Address.City,
                        Images = i.Property.Images.Select(img => img.Url).ToList()
                    }
                })
                .ToListAsync(ct);

            return new GetBuyerInquiriesResponse
            {
                Count = inquiries.Count,
                Inquiries = inquiries
            };
        }
    }
}
