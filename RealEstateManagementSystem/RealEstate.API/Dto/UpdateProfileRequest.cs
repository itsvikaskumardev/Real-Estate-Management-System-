using Microsoft.AspNetCore.Http;

namespace RealEstate.API.Dto
{
    public class UpdateProfileRequest
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public bool RemoveProfilePic { get; set; }
        public IFormFile? ProfilePic { get; set; }
    }
}
