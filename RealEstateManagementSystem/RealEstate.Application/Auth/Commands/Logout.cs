using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Auth.Commands
{
    public record LogoutCommand : IRequest<LogoutResponse>;

    public record LogoutResponse
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
    }

    public class LogoutCommandHandler : IRequestHandler<LogoutCommand, LogoutResponse>
    {
        public Task<LogoutResponse> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            // If we needed to blacklist tokens or clear server-side session, it would go here.
            return Task.FromResult(new LogoutResponse
            {
                Success = true,
                Message = "Logged out successfully"
            });
        }
    }
}
