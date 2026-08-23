using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Models
{
    public class PaginatedList<T>
    {
        public List<T> Items { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }

        public int TotalPages =>
            (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}
