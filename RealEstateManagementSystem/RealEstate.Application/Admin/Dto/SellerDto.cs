using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Dto
{
    public record SellerDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public bool IsApproved { get; init; }
    }
}
