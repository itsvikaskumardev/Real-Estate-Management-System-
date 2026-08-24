using System;
using System.Collections.Generic;
using System.Text;

namespace RealEstate.Application.Common.Models
/*
 This gives your application a consistent success/failure response from commands and queries.

    For example, CreatePropertyCommandHandler could return:

return Result<Guid>.Ok(property.Id);

or:

return Result<Guid>.Failure("Property could not be created.");
 
 */
{
    public class Result<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Error { get; set; }

        public static Result<T> Ok(T data)
        {
            return new Result<T>
            {
                Success = true,
                Data = data
            };
        }

        public static Result<T> Failure(string error)
        {
            return new Result<T>
            {
                Success = false,
                Error = error
            };
        }
    }
}
