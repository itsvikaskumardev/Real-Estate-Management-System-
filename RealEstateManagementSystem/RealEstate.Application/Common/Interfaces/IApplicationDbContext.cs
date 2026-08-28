using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Token> Tokens { get; }
        DbSet<RealEstate.Domain.Entities.Property> Properties { get; }
        DbSet<PropertyImage> PropertyImages { get; }
        DbSet<Inquiry> Inquiries { get; }
        DbSet<RealEstate.Domain.Entities.Wishlist> Wishlists { get; }
        DbSet<Contact> Contacts { get; }
        DbSet<Chat> Chats { get; }
        DbSet<ChatMessage> ChatMessages { get; }
        // ...your other DbSets
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
