using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Infrastructure.Services
{
    public class FileStorageService : IFileStorageService
    {
        public async Task<string> UploadAsync(
            Stream file,
            string fileName)
        {
            // Implement Azure Blob/Cloudinary/S3 later
            return await Task.FromResult(fileName);
        }

        public Task DeleteAsync(string fileUrl)
        {
            // Implement later
            return Task.CompletedTask;
        }
    }
}
