using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> UploadAsync(Stream file, string fileName);
        Task DeleteAsync(string fileUrl);
    }
}
