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

/*
 
 Yes, Value Objects are useful, but you don't have to create them just because you're using Clean Architecture/CQRS. They are for data that represents a concept/value rather than an independent entity.

1. What is a Value Object?

A Value Object is something that:

has no independent identity/ID
is defined by its values
usually doesn't exist independently from an entity

For example:

public class Address
{
    public string Street { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string ZipCode { get; set; }
}

An address doesn't really need an AddressId.

A property might have:

Property
 ├── Id
 ├── Title
 ├── Price
 └── Address
      ├── Street
      ├── City
      ├── State
      └── ZipCode

The Property is an entity because it has an identity (PropertyId).

The Address is a value because its identity isn't important.

2. Why Address makes sense for your Real Estate project

You will probably have addresses in multiple places:

Property
 └── Address

Agent
 └── OfficeAddress

User
 └── Address

Instead of having loose properties everywhere:

public string Street { get; set; }
public string City { get; set; }
public string State { get; set; }
public string ZipCode { get; set; }

you can group them:

public Address Address { get; set
 */
