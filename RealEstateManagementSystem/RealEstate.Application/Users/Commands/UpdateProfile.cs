using MediatR;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using RealEstate.Application.Auth.Dto;

namespace RealEstate.Application.Users.Commands
{
    public record UpdateProfileCommand : IRequest<UpdateProfileResponse>
    {
        public string? Name { get; init; }
        public string? Phone { get; init; }
        public string? Address { get; init; }
        public bool RemoveProfilePic { get; init; }
        public Stream? ProfilePicStream { get; init; }
        public string? ProfilePicFileName { get; init; }
    }

    public record UpdateProfileResponse
    {
        public string Message { get; init; } = string.Empty;
        public bool Success { get; init; }
        public UserDto User { get; init; } = null!;
    }



    public class UpdateProfileCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService)
        : IRequestHandler<UpdateProfileCommand, UpdateProfileResponse>
    {
        public async Task<UpdateProfileResponse> Handle(
            UpdateProfileCommand request,
            CancellationToken cancellationToken)
        {
            if (currentUser.UserId is null)
                throw new UnauthorizedException("Not authenticated");

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUser.UserId, cancellationToken);

            if (user is null)
                throw new NotFoundException(nameof(User), currentUser.UserId);

            // Handle profile pic upload
            if (request.ProfilePicStream is not null && request.ProfilePicFileName is not null)
            {
                // TODO: switch to Azure Blob Storage implementation later
                var url = await fileStorageService.UploadAsync(
                    request.ProfilePicStream,
                    request.ProfilePicFileName,
                    "profiles",
                    cancellationToken);

                user.ProfilePic = url;
            }
            else if (request.RemoveProfilePic)
            {
                user.ProfilePic = null;
            }

            if (request.Name is not null) user.Name = request.Name;
            if (request.Phone is not null) user.Phone = request.Phone;
            if (request.Address is not null) user.Address = request.Address;

            await context.SaveChangesAsync(cancellationToken);

            return new UpdateProfileResponse
            {
                Message = "Profile updated",
                Success = true,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Phone = user.Phone,
                    Address = user.Address,
                    ProfilePic = user.ProfilePic
                }
            };
        }
    }
}
