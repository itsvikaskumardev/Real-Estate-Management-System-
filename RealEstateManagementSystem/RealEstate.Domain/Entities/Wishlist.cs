using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.Entities
{

    public class Wishlist
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int PropertyId { get; set; }
        public Property Property { get; set; } = null!;
    }
}
