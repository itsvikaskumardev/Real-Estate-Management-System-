using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> UploadAsync(Stream fileStream, string fileName, string folder, CancellationToken ct = default);
        Task DeleteAsync(string fileUrl, CancellationToken ct = default);
    }
}
