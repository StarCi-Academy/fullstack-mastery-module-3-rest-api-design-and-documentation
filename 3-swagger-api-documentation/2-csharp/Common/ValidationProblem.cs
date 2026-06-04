using Microsoft.AspNetCore.Mvc;

namespace SwaggerDemo.Common;

/// <summary>
/// Turns model-validation failures (400) into the unified error envelope:
/// <c>{ statusCode, error, message, timestamp, path }</c>.
/// </summary>
public static class ValidationProblem
{
    /// <summary>
    /// factory for <c>InvalidModelStateResponseFactory</c>; flattens field errors into one message string.
    /// </summary>
    /// <returns>a bad-request result carrying the error envelope.</returns>
    public static IActionResult Build(ActionContext context)
    {
        var message = string.Join(", ", context.ModelState
            .Where(entry => entry.Value is not null && entry.Value.Errors.Count > 0)
            .Select(entry => $"{entry.Key}: {entry.Value!.Errors.First().ErrorMessage}"));

        return new BadRequestObjectResult(new
        {
            statusCode = StatusCodes.Status400BadRequest,
            error = "ValidationException",
            message,
            timestamp = DateTime.UtcNow.ToString("o"),
            path = context.HttpContext.Request.Path.Value,
        });
    }
}
