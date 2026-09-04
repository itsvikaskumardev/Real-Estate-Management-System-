using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        //public DbSet<RealEstate.Domain.Entities.Property> Properties { get; set; }
        public DbSet<User> Users => Set<User>();
        public DbSet<Token> Tokens => Set<Token>();
        public DbSet<Property> Properties => Set<Property>();
        public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
        public DbSet<Inquiry> Inquiries => Set<Inquiry>();
        public DbSet<Wishlist> Wishlists => Set<Wishlist>();
        public DbSet<Contact> Contacts => Set<Contact>();
        public DbSet<Chat> Chats => Set<Chat>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<Document> Documents => Set<Document>();
        public DbSet<SiteVisit> SiteVisits => Set<SiteVisit>();
        public DbSet<SavedSearch> SavedSearches => Set<SavedSearch>();
        public DbSet<Review> Reviews => Set<Review>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.ApplyConfigurationsFromAssembly(System.Reflection.Assembly.GetExecutingAssembly());

            builder.Entity<SiteVisit>()
                .HasOne(sv => sv.Property)
                .WithMany()
                .HasForeignKey(sv => sv.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<SiteVisit>()
                .HasOne(sv => sv.Buyer)
                .WithMany()
                .HasForeignKey(sv => sv.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<SiteVisit>()
                .HasOne(sv => sv.Seller)
                .WithMany()
                .HasForeignKey(sv => sv.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<SavedSearch>()
                .HasOne(ss => ss.Buyer)
                .WithMany()
                .HasForeignKey(ss => ss.BuyerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Review>()
                .HasOne(r => r.Buyer)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.Property)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(builder);
        }
    }
}
