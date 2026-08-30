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
    /*
     
     A record is a lightweight, immutable type mainly used to transport data.
We use records for Queries and Responses because their data should remain unchanged while being passed around.

     */

    /*
     GetAllContactsQuery → Input (Request) sent to MediatR.
GetAllContactsResponse → Output (Response) returned by the handler.
IRequest<GetAllContactsResponse> tells MediatR: "When this query is handled, it will return a GetAllContactsResponse."
     
     
     */

    public record GetAllContactsResponse
    {
        public List<ContactDto> Contacts { get; init; } = [];
    }


    /*  This below line tells you the Input and Output of the handler:*/
    /*
         Input: GetAllContactsQuery and Output: GetAllContactsResponse

    Because:IRequestHandler<Input, Output>

    GetAllContactsQuery  →  Handler  →  GetAllContactsResponse
           INPUT                         OUTPUT

    So here:dbContext is just a dependency injected into the handler to access the database.
         */
    public class GetAllContactsQueryHandler(IApplicationDbContext dbContext)
        : IRequestHandler<GetAllContactsQuery, GetAllContactsResponse>
    {

        public async Task<GetAllContactsResponse> Handle(
            GetAllContactsQuery request,
            CancellationToken ct)

        /*

     Input : GetAllContactsQuery request

    This is the input coming into the `Handle()` method.

    Output : Task<GetAllContactsResponse>

    This is the output the method will return.

    ### What the whole line means

    * `public` → method can be accessed from outside the class.
    * `async` → method performs asynchronous work, such as database calls.
    * `Task<GetAllContactsResponse>` → it will eventually return `GetAllContactsResponse`.
    * `Handle()` → this is the method that executes the query.
    * `request` → contains the `GetAllContactsQuery` input.
    * `ct` → `CancellationToken`, used to cancel the operation if needed.

             */
        {

            var contacts = await dbContext.Contacts
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
                .ToListAsync(ct);

            return new GetAllContactsResponse
            {
                Contacts = contacts
            };
        }
    }
}
