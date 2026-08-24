using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.ValueObjects


{
    public sealed record Address(string Street, string City, string State, string Pincode);
}
