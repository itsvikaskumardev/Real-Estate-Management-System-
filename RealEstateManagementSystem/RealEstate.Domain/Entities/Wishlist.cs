using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{

    public class Wishlist
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid PropertyId { get; set; }
        public Property Property { get; set; } = null!;
    }
}
