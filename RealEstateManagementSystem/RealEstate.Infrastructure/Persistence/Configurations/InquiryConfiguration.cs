using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Infrastructure.Persistence.Configurations
{
    public class InquiryConfiguration : IEntityTypeConfiguration<Inquiry>
    {
        public void Configure(EntityTypeBuilder<Inquiry> builder)
        {
            builder.Property(i => i.Message)
                .IsRequired();

            builder.Property(i => i.IsRead)
                .IsRequired();

            builder.HasOne(i => i.Property)
                .WithMany()
                .HasForeignKey(i => i.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Buyer)
                .WithMany()
                .HasForeignKey(i => i.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(i => i.Seller)
                .WithMany()
                .HasForeignKey(i => i.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(i => i.SellerId);
            builder.HasIndex(i => i.BuyerId);
        }
    }
}
