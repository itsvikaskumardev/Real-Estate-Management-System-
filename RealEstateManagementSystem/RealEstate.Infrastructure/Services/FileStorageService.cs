using RealEstate.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Infrastructure.Services
{
    public class FileStorage : IFileStorageService
    {
        public Task<string> UploadAsync(
            Stream fileStream,
            string fileName,
            string folder,
            CancellationToken ct = default)
        {
            // TODO: implement Azure Blob Storage upload here
            // e.g. BlobServiceClient -> GetBlobContainerClient(folder) -> UploadAsync
            throw new NotImplementedException("File storage not yet implemented — Azure Blob Storage pending");


        }
        public Task DeleteAsync(string fileUrl, CancellationToken ct = default)
        {
            // TODO: implement Azure Blob Storage delete here
            // e.g. parse blob name from fileUrl -> BlobContainerClient.DeleteBlobIfExistsAsync
            throw new NotImplementedException("File storage not yet implemented — Azure Blob Storage pending");
        }
    }
}
