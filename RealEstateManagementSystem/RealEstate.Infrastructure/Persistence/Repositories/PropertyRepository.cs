using Microsoft.EntityFrameworkCore.Metadata.Internal;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using RealEstate.Domain.Entities;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Persistence.Repositories
{
    public class PropertyRepository : IRepository<Property>
    {
        private readonly ApplicationDbContext _context;

        public PropertyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Property?> GetByIdAsync(Guid id)
        {
            return await _context.Properties
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task AddAsync(Property entity)
        {
            await _context.Properties.AddAsync(entity);
        }

        public void Update(Property entity)
        {
            _context.Properties.Update(entity);
        }

        public void Delete(Property entity)
        {
            _context.Properties.Remove(entity);
        }
    }
}
