using MediatR;
using RealEstate.Application.Common.Builders;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Buyer.Queries
{
    public record GetTransactionInvoiceHtmlQuery(Guid TransactionId) : IRequest<string?>;

    public class GetTransactionInvoiceHtmlQueryHandler(IMediator mediator) : IRequestHandler<GetTransactionInvoiceHtmlQuery, string?>
    {
        public async Task<string?> Handle(GetTransactionInvoiceHtmlQuery request, CancellationToken ct)
        {
            var details = await mediator.Send(new GetTransactionInvoiceDetailsQuery(request.TransactionId), ct);

            if (details == null)
                return null;

            return InvoiceHtmlBuilder.Build(details);
        }
    }
}
