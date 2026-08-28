using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Contacts.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Contacts.Queries
{
    public record GetAllContactsQuery : IRequest<GetAllContactsResponse>;

    public record GetAllContactsResponse
    {
        public List<ContactDto> Contacts { get; init; } = [];
    }



    public class GetAllContactsQueryHandler(IApplicationDbContext context)
        : IRequestHandler<GetAllContactsQuery, GetAllContactsResponse>
    {
        public async Task<GetAllContactsResponse> Handle(
            GetAllContactsQuery request,
            CancellationToken cancellationToken)
        {
            var contacts = await context.Contacts
                .Where(c => c.IsActive && !c.IsDeleted)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new ContactDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Email = c.Email,
                    Phone = c.Phone,
                    Role = c.Role.ToString(),
                    Message = c.Message,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return new GetAllContactsResponse
            {
                Contacts = contacts
            };
        }
    }
}
