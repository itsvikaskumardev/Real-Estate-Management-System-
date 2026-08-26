using MediatR;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Inquiries.Dto;
using Microsoft.EntityFrameworkCore;

using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Inquiries.Queries
{
    public record GetSellerInquiriesQuery : IRequest<GetSellerInquiriesResponse>;

    public record GetSellerInquiriesResponse
    {
        public int Count { get; init; }
        public List<SellerInquiryDto> Inquiries { get; init; } = [];
    }





    public record PropertySummaryDto
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public string City { get; init; } = string.Empty;
        public List<string> Images { get; init; } = [];
    }

    public class GetSellerInquiriesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
        : IRequestHandler<GetSellerInquiriesQuery, GetSellerInquiriesResponse>
    {
        public async Task<GetSellerInquiriesResponse> Handle(
            GetSellerInquiriesQuery request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var inquiries = await context.Inquiries
                .Where(i => i.SellerId == currentUser.UserId)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new SellerInquiryDto
                {
                    Id = i.Id,
                    Message = i.Message,
                    IsRead = i.IsRead,
                    CreatedAt = i.CreatedAt,
                    Buyer = new BuyerDto
                    {
                        Id = i.Buyer.Id,
                        Name = i.Buyer.Name,
                        Email = i.Buyer.Email,
                        Phone = i.Buyer.Phone
                    },
                    Property = new PropertySummaryDto
                    {
                        Id = i.Property.Id,
                        Title = i.Property.Title,
                        Price = i.Property.Price,
                        City = i.Property.Address.City,
                        Images = i.Property.Images.Select(img => img.Url).ToList()
                    }
                })
                .ToListAsync(cancellationToken);

            return new GetSellerInquiriesResponse
            {
                Count = inquiries.Count,
                Inquiries = inquiries
            };
        }
    }
}
