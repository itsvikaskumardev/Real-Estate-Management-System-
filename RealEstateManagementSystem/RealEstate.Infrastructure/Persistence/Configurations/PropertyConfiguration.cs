using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Infrastructure.Persistence.Configurations
{
    public class PropertyConfiguration : IEntityTypeConfiguration<Property>
    {
        public void Configure(EntityTypeBuilder<Property> builder)
        {
            builder.Property(p => p.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(p => p.Description)
                .IsRequired();

            builder.Property(p => p.Price)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.OwnsOne(p => p.Address, a =>
            {
                a.Property(ad => ad.Street).HasColumnName("Street").HasMaxLength(200);
                a.Property(ad => ad.City).HasColumnName("City").HasMaxLength(100);
                a.Property(ad => ad.State).HasColumnName("State").HasMaxLength(100);
                a.Property(ad => ad.Pincode).HasColumnName("Pincode").HasMaxLength(10);
                
                a.HasIndex(ad => ad.City);
            });

            builder.Property(p => p.PropertyType)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(p => p.Furnishing)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(p => p.Status)
                .HasConversion<string>()
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(p => p.AreaSize)
                .HasColumnType("decimal(18,2)");

            // Primitive collections (EF Core 8+) — stored as JSON column
            builder.Property(p => p.Amenities)
                .HasColumnType("nvarchar(max)");

            builder.Property(p => p.ViewedBy)
                .HasColumnType("nvarchar(max)");

            builder.HasOne(p => p.Seller)
                .WithMany()
                .HasForeignKey(p => p.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Images)
                .WithOne(i => i.Property)
                .HasForeignKey(i => i.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // builder.HasIndex(p => p.City); // Moved to OwnsOne or remove
            builder.HasIndex(p => p.Status);
        }
    }
}
