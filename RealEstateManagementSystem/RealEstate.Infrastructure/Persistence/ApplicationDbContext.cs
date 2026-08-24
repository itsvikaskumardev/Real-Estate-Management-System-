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

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.ApplyConfigurationsFromAssembly(System.Reflection.Assembly.GetExecutingAssembly());

            base.OnModelCreating(builder);
        }
    }
}
