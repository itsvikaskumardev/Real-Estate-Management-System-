using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using RealEstate.Application.Common.Interfaces;


namespace RealEstate.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        public Task SendAsync(
            string email,
            string subject,
            string message,
            CancellationToken cancellationToken = default)
        {
            // Email provider implementation later
            return Task.CompletedTask;
        }
    }
}
