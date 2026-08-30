using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Infrastructure.Configuration;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Infrastructure.Services
{
    public class FileStorage : IFileStorageService
    {
        private readonly Cloudinary _cloudinary;

        public FileStorage(IOptions<CloudinarySettings> settings)
        {
            var account = new Account(
                settings.Value.CloudName,
                settings.Value.ApiKey,
                settings.Value.ApiSecret);

            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<string> UploadAsync(
            Stream fileStream,
            string fileName,
            string folder,
            CancellationToken ct = default)
        {
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(fileName, fileStream),
                Folder = folder
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, ct);

            if (uploadResult.Error != null)
            {
                throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
            }

            return uploadResult.SecureUrl.ToString();
        }

        public async Task DeleteAsync(string fileUrl, CancellationToken ct = default)
        {
            try
            {
                var uri = new Uri(fileUrl);
                var publicId = Path.GetFileNameWithoutExtension(uri.AbsolutePath);
                var deletionParams = new DeletionParams(publicId);
                await _cloudinary.DestroyAsync(deletionParams);
            }
            catch (Exception ex)
            {
                throw new Exception($"Cloudinary deletion failed: {ex.Message}");
            }
        }
    }
}
