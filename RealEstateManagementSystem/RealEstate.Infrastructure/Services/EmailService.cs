using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Infrastructure.Services
{
    public class EmailService
    {
        public Task SendAsync(
            string email,
            string subject,
            string message)
        {
            // Email provider implementation later
            return Task.CompletedTask;
        }
    }
}
