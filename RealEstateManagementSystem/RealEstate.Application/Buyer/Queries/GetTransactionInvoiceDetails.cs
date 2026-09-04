using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Buyer.Queries
{
    public class InvoiceDetailsDto
    {
        public Guid TransactionId { get; set; }
        public string? PropertyTitle { get; set; }
        public string? PropertyCity { get; set; }
        public string? PropertyType { get; set; }
        
        public string? BuyerName { get; set; }
        public string? BuyerEmail { get; set; }
        
        public string? SellerName { get; set; }
        public string? SellerEmail { get; set; }
        
        public decimal Price { get; set; }
        public decimal AdminCommission { get; set; }
        public decimal SellerRevenue { get; set; }
        
        public string? Status { get; set; }
        public DateTime PurchaseDate { get; set; }
    }

    public record GetTransactionInvoiceDetailsQuery(Guid TransactionId) : IRequest<InvoiceDetailsDto?>;

    public class GetTransactionInvoiceDetailsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<GetTransactionInvoiceDetailsQuery, InvoiceDetailsDto?>
    {
        public async Task<InvoiceDetailsDto?> Handle(GetTransactionInvoiceDetailsQuery request, CancellationToken ct)
        {
            if (currentUserService.UserId is null)
                return null;

            var transaction = await dbContext.Transactions
                .Include(t => t.Property)
                .Include(t => t.Buyer)
                .Include(t => t.Seller)
                .FirstOrDefaultAsync(t => t.Id == request.TransactionId && t.BuyerId == currentUserService.UserId, ct);

            if (transaction == null)
                return null;

            return new InvoiceDetailsDto
            {
                TransactionId = transaction.Id,
                PropertyTitle = transaction.Property?.Title ?? "Unknown Property",
                PropertyCity = transaction.Property?.Address?.City ?? "Unknown City",
                PropertyType = transaction.Property?.PropertyType.ToString() ?? "Unknown",
                BuyerName = transaction.Buyer?.Name ?? "Unknown Buyer",
                BuyerEmail = transaction.Buyer?.Email ?? "",
                SellerName = transaction.Seller?.Name ?? "Unknown Seller",
                SellerEmail = transaction.Seller?.Email ?? "",
                Price = transaction.Price,
                AdminCommission = transaction.AdminCommission,
                SellerRevenue = transaction.SellerRevenue,
                Status = transaction.Status,
                PurchaseDate = transaction.CreatedAt
            };
        }
    }
}
