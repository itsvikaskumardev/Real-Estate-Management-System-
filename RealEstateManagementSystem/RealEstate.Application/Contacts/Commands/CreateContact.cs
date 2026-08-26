using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Contacts.Commands
{
    public record CreateContactCommand : IRequest<CreateContactResponse>
    {
        public string Name { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? Phone { get; init; }
        public ContactRole Role { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public record CreateContactResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public class CreateContactCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<CreateContactCommandHandler> logger)
        : IRequestHandler<CreateContactCommand, CreateContactResponse>
    {
        public async Task<CreateContactResponse> Handle(
            CreateContactCommand request,
            CancellationToken cancellationToken)
        {
            var contact = new Contact
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Role = request.Role,
                Message = request.Message
            };

            context.Contacts.Add(contact);
            await context.SaveChangesAsync(cancellationToken);

            var adminEmail = configuration["Admin:NotificationEmail"];

            if (!string.IsNullOrWhiteSpace(adminEmail))
            {
                var adminMessage = $"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                    <h2 style="color: #0d9488;">New Contact Request</h2>
                    <p>You have received a new message from the platform.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
                        <p><strong>Name:</strong> {request.Name}</p>
                        <p><strong>Email:</strong> {request.Email}</p>
                        <p><strong>Phone:</strong> {request.Phone ?? "N/A"}</p>
                        <p><strong>Role:</strong> {request.Role}</p>
                        <p style="margin-top: 15px;"><strong>Message:</strong></p>
                        <p style="font-style: italic; color: #475569;">"{request.Message}"</p>
                    </div>
                </div>
                """;

                try
                {
                    await emailService.SendAsync(
                        adminEmail,
                        $"New Contact Message from {request.Name}",
                        adminMessage,
                        cancellationToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Admin notification email failed for contact {ContactId}", contact.Id);
                }
            }

            return new CreateContactResponse
            {
                Success = true,
                Message = "Message sent successfully"
            };
        }
    }
}
