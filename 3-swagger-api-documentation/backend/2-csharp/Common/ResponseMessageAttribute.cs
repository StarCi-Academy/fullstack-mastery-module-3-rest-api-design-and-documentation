namespace SwaggerDemo.Common;

/// <summary>
/// attaches a custom success message to an action's response envelope.
/// </summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class ResponseMessageAttribute : Attribute
{
    /// <summary>
    /// message placed into the envelope <c>message</c> field.
    /// </summary>
    public string Message { get; }

    /// <summary>
    /// constructs the attribute with the given message.
    /// </summary>
    /// <param name="message">the message text.</param>
    public ResponseMessageAttribute(string message) => Message = message;
}
