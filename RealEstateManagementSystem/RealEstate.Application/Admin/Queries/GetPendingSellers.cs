using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Admin.Dto;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Queries
{
    public record GetPendingSellersQuery : IRequest<GetPendingSellersResponse>;

    public record GetPendingSellersResponse
    {
        public int Count { get; init; }
        public List<PendingSellerDto> PendingSellers { get; init; } = [];
    }



    public class GetPendingSellersQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<GetPendingSellersQuery, GetPendingSellersResponse>
    {
        public async Task<GetPendingSellersResponse> Handle(
            GetPendingSellersQuery request,
            CancellationToken ct)
        {
            var pendingSellersList = await dbContext.Users
                .Where(u => u.Role == UserRole.Seller && !u.IsApproved && u.IsActive && !u.IsDeleted)
                .Select(u => new PendingSellerDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    CreatedAt = u.CreatedAt,
                    OnboardingStatus = u.OnboardingStatus
                })
                .ToListAsync(ct);

            var sellerIds = pendingSellersList.Select(s => s.Id).ToList();
            
            var documents = await dbContext.Documents
                .Where(d => sellerIds.Contains(d.UserId))
                .ToListAsync(ct);

            foreach (var seller in pendingSellersList)
            {
                seller.Documents = documents
                    .Where(d => d.UserId == seller.Id)
                    .Select(d => new RealEstate.Application.Documents.Queries.DocumentDto(d.Id, d.DocumentType, d.DocumentName, d.FileUrl, d.Status, d.CreatedAt, d.VerifiedAt))
                    .ToList();
            }

            return new GetPendingSellersResponse
            {
                Count = pendingSellersList.Count,
                PendingSellers = pendingSellersList
            };
        }
    }
}
