using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Infrastructure.Persistence.Configurations
{
    public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Price).HasColumnType("decimal(18,2)");
            builder.Property(t => t.AdminCommission).HasColumnType("decimal(18,2)");
            builder.Property(t => t.SellerRevenue).HasColumnType("decimal(18,2)");
            builder.Property(t => t.Status).IsRequired().HasMaxLength(50);

            builder.HasOne(t => t.Property)
                .WithMany()
                .HasForeignKey(t => t.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.Buyer)
                .WithMany()
                .HasForeignKey(t => t.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.Seller)
                .WithMany()
                .HasForeignKey(t => t.SellerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
