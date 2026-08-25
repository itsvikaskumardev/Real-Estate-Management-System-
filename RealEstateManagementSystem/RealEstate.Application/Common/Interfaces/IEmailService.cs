using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IEmailService
    {
        Task SendAsync(string email, string subject, string message, CancellationToken cancellationToken = default);
    }
}
