using MediatR;
using RealEstate.Application.Common.Interfaces;
using System;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Property.Dto;

namespace RealEstate.Application.Admin.Queries
{
    public record GetAllInquiriesQuery : IRequest<GetAllInquiriesResponse>;

    public record GetAllInquiriesResponse
    {
        public int Count { get; init; }
        public List<InquiryListItemDto> Inquiries { get; init; } = [];
    }


    public class GetAllInquiriesQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<GetAllInquiriesQuery, GetAllInquiriesResponse>
    {
        public async Task<GetAllInquiriesResponse> Handle(
            GetAllInquiriesQuery request,
            CancellationToken ct)
        {
            var inquiries = await dbContext.Inquiries
                .Where(i => i.IsActive && !i.IsDeleted)
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
                .ToListAsync(ct);

            return new GetAllInquiriesResponse
            {
                Count = inquiries.Count,
                Inquiries = inquiries
            };
        }
    }
}
