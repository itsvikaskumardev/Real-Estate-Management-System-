using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Admin.Dto
{
    public record DashboardStatsDto
    {
        public int TotalUsers { get; init; }
        public int TotalProperties { get; init; }
        public int ActiveListings { get; init; }
        public int SoldProperties { get; init; }
        public decimal TotalPlatformRevenue { get; init; }
        public int UnverifiedProperties { get; init; }
    }
}
