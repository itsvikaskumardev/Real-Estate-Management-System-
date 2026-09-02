using MediatR;
using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Admin.Commands
{
    public record VerifyPropertyCommand(Guid PropertyId, bool Approve) : IRequest<bool>;

    public class VerifyPropertyCommandHandler(IApplicationDbContext dbContext) : IRequestHandler<VerifyPropertyCommand, bool>
    {
        public async Task<bool> Handle(VerifyPropertyCommand request, CancellationToken ct)
        {
            var property = await dbContext.Properties.FindAsync([request.PropertyId], ct);
            if (property == null) return false;

            property.IsVerified = request.Approve;
            // If rejected, you might also want to set IsDeleted = true or Status = Rejected, depending on requirements.



            await dbContext.SaveChangesAsync(ct);
            return true;
        }
    }
}
