using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Domain.ValueObjects
{
    public sealed class Address
    {
        public string Street { get; }
        public string City { get; }
        public string State { get; }
        public string Pincode { get; }

        public Address(string street, string city, string state, string pincode)
        {
            Street = street;
            City = city;
            State = state;
            Pincode = pincode;
        }
    }
}
