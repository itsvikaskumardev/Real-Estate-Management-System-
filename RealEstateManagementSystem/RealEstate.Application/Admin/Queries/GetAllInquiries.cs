using MediatR;
using RealEstate.Application.Common.Interfaces;
using System;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text;
using RealEstate.Application.Admin.Dto;

namespace RealEstate.Application.Admin.Queries
{
    public record GetAllInquiriesQuery : IRequest<GetAllInquiriesResponse>;

    public record GetAllInquiriesResponse
    {
        public int Count { get; init; }
        public List<InquiryListItemDto> Inquiries { get; init; } = [];
    }


    public class GetAllInquiriesQueryHandler(IApplicationDbContext context)
        : IRequestHandler<GetAllInquiriesQuery, GetAllInquiriesResponse>
    {
        public async Task<GetAllInquiriesResponse> Handle(
            GetAllInquiriesQuery request,
            CancellationToken cancellationToken)
        {
            var inquiries = await context.Inquiries
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new InquiryListItemDto
                {
                    Id = i.Id,
                    Message = i.Message,
                    IsRead = i.IsRead,
                    CreatedAt = i.CreatedAt,
                    Buyer = new BuyerDto
                    {
                        Id = i.Buyer.Id,
                        Name = i.Buyer.Name,
                        Email = i.Buyer.Email
                    },
                    Seller = new SellerDto
                    {
                        Id = i.Seller.Id,
                        Name = i.Seller.Name,
                        Email = i.Seller.Email
                    },
                    Property = new PropertyDto
                    {
                        Id = i.Property.Id,
                        Title = i.Property.Title,
                        Price = i.Property.Price
                    }
                })
                .ToListAsync(cancellationToken);

            return new GetAllInquiriesResponse
            {
                Count = inquiries.Count,
                Inquiries = inquiries
            };
        }
    }
}
