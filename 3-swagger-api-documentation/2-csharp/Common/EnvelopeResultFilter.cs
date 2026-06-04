using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SwaggerDemo.Common;

/// <summary>
/// wraps every successful response in a stable JSON envelope.
/// </summary>
public sealed class EnvelopeResultFilter : IResultFilter
{
    /// <summary>
    /// reads the HTTP status and <c>[ResponseMessage]</c> then maps the body into the envelope.
    /// </summary>
    /// <param name="context">action result execution context.</param>
    public void OnResultExecuting(ResultExecutingContext context)
    {
        if (context.Result is not ObjectResult objectResult)
        {
            return;
        }

        var statusCode = objectResult.StatusCode ?? StatusCodes.Status200OK;

        // only wrap successful 2xx responses; error responses already carry their own envelope.
        if (statusCode is < 200 or >= 300)
        {
            return;
        }

        // pull the message from the [ResponseMessage] attribute on the action, defaulting to "Success".
        var message = "Success";
        if (context.ActionDescriptor is ControllerActionDescriptor descriptor)
        {
            var attribute = descriptor.MethodInfo
                .GetCustomAttributes(typeof(ResponseMessageAttribute), false)
                .OfType<ResponseMessageAttribute>()
                .FirstOrDefault();
            if (attribute is not null)
            {
                message = attribute.Message;
            }
        }

        context.Result = new ObjectResult(new
        {
            statusCode,
            message,
            data = objectResult.Value,
            timestamp = DateTime.UtcNow.ToString("o"),
        })
        {
            StatusCode = statusCode,
        };
    }

    /// <summary>
    /// no post-execution work required.
    /// </summary>
    /// <param name="context">executed result context.</param>
    public void OnResultExecuted(ResultExecutedContext context)
    {
    }
}
