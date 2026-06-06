// Program.cs — Unified Response & Errors lesson (ASP.NET Core Minimal API)
//
// Demonstrates the unified output contract using a single middleware lambda that
// intercepts both exceptions (error envelope) and unmatched routes (404 envelope).
// All success responses are built inline in each route handler.
//
// Contract shapes:
//   Success: { statusCode, message, data, timestamp }
//   Error:   { statusCode, error, message, details?, timestamp, path }
//
// No stack traces, no internal details ever reach the client.

using Microsoft.AspNetCore.Http;
using System.Collections.Concurrent;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Read PORT from environment (set in appsettings or environment variable);
// fall back to "3000" for local development so the demo starts without any configuration.
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://127.0.0.1:{port}");  // loopback only — prevents Windows Firewall prompts

var app = builder.Build();

// Thread-safe in-memory user store. Pre-seeded with one demo user.
// ConcurrentBag is unordered; routes that return lists sort by Id before responding.
var users = new ConcurrentBag<User>
{
    new User { Id = 1, Name = "John Doe" }
};

// Monotonic counter for new user IDs; Interlocked.Increment ensures thread safety.
int nextId = 2;

// ---------------------------------------------------------------------------
// Global middleware: exception mapping and 404 catch-all
//
// Positioned before all route handlers so every exception thrown inside a route
// handler is caught here and normalized to the error envelope.  The 404 check
// after `await next()` catches unmatched routes (the pipeline ran but no handler
// responded with a body — ASP.NET Core leaves the status at 404 in that case).
// ---------------------------------------------------------------------------
app.Use(async (context, next) =>
{
    try
    {
        await next();  // run the rest of the pipeline (route handlers)

        // After pipeline completes: if status is 404 and nothing has been written yet,
        // it means no route matched — return a structured 404 error envelope.
        if (context.Response.StatusCode == 404 && !context.Response.HasStarted)
        {
            context.Response.ContentType = "application/json";
            var path = context.Request.Path.ToString();
            var method = context.Request.Method;

            // "Cannot METHOD PATH" mirrors the NestJS / Express convention for unmatched routes.
            var bodyObj = new
            {
                statusCode = 404,
                error = "NotFoundException",
                message = $"Cannot {method} {path}",
                timestamp = DateTime.UtcNow.ToString("o"),  // ISO 8601 round-trip format
                path = path
            };
            await context.Response.WriteAsJsonAsync(bodyObj);
        }
    }
    catch (NotFoundException ex)
    {
        // Domain 404: user looked up but not found — include structured details.
        context.Response.StatusCode = 404;
        context.Response.ContentType = "application/json";
        var bodyObj = new
        {
            statusCode = 404,
            error = "NotFoundException",
            message = ex.Message,
            // details is an object for NotFound (resource + id) rather than an array.
            details = new { resource = ex.Resource, id = ex.Id },
            timestamp = DateTime.UtcNow.ToString("o"),
            path = context.Request.Path.ToString()
        };
        await context.Response.WriteAsJsonAsync(bodyObj);
    }
    catch (BadRequestException ex)
    {
        // Validation 400: promote the message list to the `details` array.
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        var bodyObj = new
        {
            statusCode = 400,
            error = "BadRequestException",
            // Join all messages into one string for the `message` field.
            message = string.Join(", ", ex.Messages),
            // Preserve the original list as `details` so clients can iterate field errors.
            details = ex.Messages,
            timestamp = DateTime.UtcNow.ToString("o"),
            path = context.Request.Path.ToString()
        };
        await context.Response.WriteAsJsonAsync(bodyObj);
    }
    catch (Exception)
    {
        // Catch-all for unexpected exceptions.
        // IMPORTANT: never use ex.Message here — it may contain SQL queries, file paths,
        // or secret values.  Always return a safe generic message to the client.
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var bodyObj = new
        {
            statusCode = 500,
            error = "Internal Error",
            message = "Internal Server Error",  // safe generic — log the real error server-side
            timestamp = DateTime.UtcNow.ToString("o"),
            path = context.Request.Path.ToString()
        };
        await context.Response.WriteAsJsonAsync(bodyObj);
    }
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /users — return all users sorted by Id in the success envelope.
app.MapGet("/users", () =>
{
    var body = new
    {
        statusCode = 200,
        message = "Lấy danh sách thành công (EN: Get all success)",
        // Sort before returning because ConcurrentBag has no inherent order.
        data = users.OrderBy(u => u.Id).ToList(),
        timestamp = DateTime.UtcNow.ToString("o")
    };
    return Results.Ok(body);
});

// GET /users/boom — deliberately throws an unhandled Exception to demonstrate that
// the global middleware catch(Exception) block intercepts ANY exception and returns
// a 500 generic error envelope with NO stack trace or internal message exposed to the client.
//
// Teaching intent (Flow 4): even a plain `throw new Exception(...)` that bypasses all domain
// exception handling is caught at the boundary and normalized to:
//   { statusCode: 500, error: "Internal Error", message: "Internal Server Error", ... }
// The real error detail stays server-side (logs), never reaching the client.
//
// Route is defined BEFORE /users/{id} so ASP.NET Core matches "boom" literally
// rather than treating it as a route parameter.
app.MapGet("/users/boom", () =>
{
    // Deliberately throw with a sensitive-looking message to prove the middleware strips it.
    // The client only ever sees "Internal Server Error", never this literal string.
    throw new Exception("boom");
});

// GET /users/{id} — look up a user by numeric id; throw NotFoundException if absent or non-numeric.
app.MapGet("/users/{id}", (string id) =>
{
    // int.TryParse returns false for non-numeric ids like "boom" — treat as not found.
    if (!int.TryParse(id, out var parsedId))
    {
        throw new NotFoundException($"User with ID {id} not found", "user", id);
    }

    // Search in-memory store; FirstOrDefault returns null when no match.
    var user = users.FirstOrDefault(u => u.Id == parsedId);
    if (user == null)
    {
        // Throw with structured details so the middleware can include { resource, id } in the envelope.
        throw new NotFoundException($"User with ID {id} not found", "user", id);
    }

    var body = new
    {
        statusCode = 200,
        message = "Lấy thông tin thành công (EN: Find user success)",
        data = user,
        timestamp = DateTime.UtcNow.ToString("o")
    };
    return Results.Ok(body);
});

// POST /users — validate the JSON payload and create a new user.
app.MapPost("/users", async (HttpContext context) =>
{
    // Attempt to deserialize the body; swallow parse errors — we validate manually below.
    CreateUserRequest? payload = null;
    try
    {
        payload = await context.Request.ReadFromJsonAsync<CreateUserRequest>();
    }
    catch
    {
        // Body was not valid JSON — payload remains null; validation below will catch it.
    }

    // Treat null payload the same as an empty object so validation runs uniformly.
    if (payload == null)
    {
        payload = new CreateUserRequest();
    }

    var messages = new List<string>();

    // Check if `name` was present and is a JSON string (JsonElement with String kind).
    if (payload.Name == null || payload.Name.Value.ValueKind != JsonValueKind.String)
    {
        // Both the type error and the length error are reported at once
        // so clients can show all problems in a single response.
        messages.Add("name must be a string");
        messages.Add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
    }
    else
    {
        var name = payload.Name.Value.GetString() ?? "";
        if (name.Length < 3)
        {
            messages.Add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
        }
    }

    if (messages.Count > 0)
    {
        // Throw with all collected errors; the middleware maps this to a 400 error envelope
        // with `details` as a string array.
        throw new BadRequestException(messages);
    }

    // At this point Name is a validated string — safe to call GetString().
    var trimmedName = payload.Name.Value.GetString()!.Trim();

    // Interlocked.Increment is atomic on int — safe for concurrent requests.
    // Subtract 1 because Increment returns the value AFTER incrementing.
    var user = new User { Id = System.Threading.Interlocked.Increment(ref nextId) - 1, Name = trimmedName };
    users.Add(user);

    var body = new
    {
        statusCode = 201,
        message = "Tạo thành công (EN: Create success)",
        data = user,
        timestamp = DateTime.UtcNow.ToString("o")
    };
    // Results.Json with explicit status code = 201 (Created) to follow HTTP semantics.
    return Results.Json(body, statusCode: 201);
});

app.Run();

// ---------------------------------------------------------------------------
// Domain models and exceptions
// ---------------------------------------------------------------------------

/// <summary>
/// Represents a user in the in-memory store.
/// Properties are serialized by <c>System.Text.Json</c> using camelCase by default.
/// </summary>
public class User
{
    /// <summary>Monotonic identifier assigned at creation time.</summary>
    public int Id { get; set; }

    /// <summary>Display name (≥ 3 characters, trimmed of whitespace).</summary>
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Request body shape for POST /users.
/// Uses <c>JsonElement?</c> for <c>Name</c> so the handler can distinguish
/// between an absent field (null) and a present non-string field (JsonValueKind != String).
/// </summary>
public class CreateUserRequest
{
    /// <summary>
    /// Raw JSON element for the <c>name</c> field.
    /// Nullable so the handler can detect a completely missing field.
    /// </summary>
    public JsonElement? Name { get; set; }
}

/// <summary>
/// Domain exception representing a missing resource (mapped to HTTP 404).
/// Carries <c>Resource</c> and <c>Id</c> so the middleware can build structured
/// <c>details: { resource, id }</c> in the error envelope.
/// </summary>
public class NotFoundException : Exception
{
    /// <summary>Resource type label (e.g. "user").</summary>
    public string Resource { get; }

    /// <summary>The id value that was looked up and not found.</summary>
    public string Id { get; }

    /// <summary>
    /// Initializes a new NotFoundException with a human-readable message and structured detail fields.
    /// </summary>
    /// <param name="message">Human-readable description (goes into the <c>message</c> envelope field).</param>
    /// <param name="resource">Resource type label.</param>
    /// <param name="id">The id that was not found.</param>
    public NotFoundException(string message, string resource, string id) : base(message)
    {
        Resource = resource;
        Id = id;
    }
}

/// <summary>
/// Domain exception representing a bad request (mapped to HTTP 400).
/// Carries a list of field-level error messages that the middleware promotes to the
/// <c>details</c> array in the error envelope so clients can iterate them individually.
/// </summary>
public class BadRequestException : Exception
{
    /// <summary>All field error messages collected during validation.</summary>
    public List<string> Messages { get; }

    /// <summary>
    /// Initializes a new BadRequestException with the list of field error messages.
    /// </summary>
    /// <param name="messages">One or more field error strings.</param>
    public BadRequestException(List<string> messages)
    {
        Messages = messages;
    }
}
