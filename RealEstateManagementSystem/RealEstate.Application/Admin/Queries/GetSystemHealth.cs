using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RealEstate.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Admin.Queries
{
    public record SystemHealthDto
    {
        public ServiceStatus Database { get; init; } = new();
        public ServiceStatus MediaStorage { get; init; } = new();
        public ServiceStatus AuthService { get; init; } = new();
        public ServiceStatus ApiGateway { get; init; } = new();
    }

    public record ServiceStatus
    {
        public string Status { get; init; } = "Offline";
    }

    public record GetSystemHealthQuery : IRequest<SystemHealthDto>;

    public class GetSystemHealthQueryHandler(IApplicationDbContext dbContext, IConfiguration configuration) : IRequestHandler<GetSystemHealthQuery, SystemHealthDto>
    {
        public async Task<SystemHealthDto> Handle(GetSystemHealthQuery request, CancellationToken ct)
        {
            // 1. Check Database
            var isDbOnline = false;
            try
            {
                await dbContext.Users.AnyAsync(ct);
                isDbOnline = true;
            }
            catch
            {
                isDbOnline = false;
            }

            // 2. Check Media Storage (Cloudinary config presence)
            var cloudinaryUrl = configuration["CloudinarySettings:Url"];
            var isMediaOnline = !string.IsNullOrWhiteSpace(cloudinaryUrl);

            // 3. Check Auth Service (JWT config presence)
            var jwtSecret = configuration["Jwt:Secret"];
            var isAuthOnline = !string.IsNullOrWhiteSpace(jwtSecret);

            return new SystemHealthDto
            {
                Database = new ServiceStatus { Status = isDbOnline ? "Online" : "Offline" },
                MediaStorage = new ServiceStatus { Status = isMediaOnline ? "Online" : "Offline" },
                AuthService = new ServiceStatus { Status = isAuthOnline ? "Online" : "Offline" },
                ApiGateway = new ServiceStatus { Status = "Online" } // If this API hits, Gateway is Online
            };
        }
    }
}
