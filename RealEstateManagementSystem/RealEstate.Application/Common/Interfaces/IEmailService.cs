using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IEmailService
    {
        Task SendAsync(
            string to,
            string subject,
            string body);
    }
}
