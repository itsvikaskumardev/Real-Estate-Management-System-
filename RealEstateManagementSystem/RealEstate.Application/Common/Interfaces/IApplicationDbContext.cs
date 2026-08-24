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
        DbSet<Property> Properties { get; }
        DbSet<PropertyImage> PropertyImages { get; }
        // ...your other DbSets
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
