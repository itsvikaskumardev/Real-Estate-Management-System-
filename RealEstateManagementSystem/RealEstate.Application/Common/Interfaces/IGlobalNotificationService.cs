using System;
using System.Threading.Tasks;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IGlobalNotificationService
    {
        Task SendNotificationAsync(Guid userId, string title, string message, string type = "info");
        Task SendPropertyStatusUpdateAsync(Guid userId, Guid propertyId, bool isVerified);
    }

    public record NotificationDto
    {
        public string Title { get; init; } = string.Empty;
        public string Message { get; init; } = string.Empty;
        public string Type { get; init; } = "info"; // "info", "success", "error", "warning"
        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    }
}
