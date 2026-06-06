using Microsoft.AspNetCore.Http;
using System.Collections.Concurrent;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Port binding
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://*:{port}");

var app = builder.Build();

// In-memory store
var users = new ConcurrentBag<User>
{
    new User { Id = 1, Name = "John Doe" }
};
int nextId = 2;

// Custom middleware for exception mapping and route-not-found
app.Use(async (context, next) =>
{
    try
    {
        await next();
        if (context.Response.StatusCode == 404 && !context.Response.HasStarted)
        {
            context.Response.ContentType = "application/json";
            var path = context.Request.Path.ToString();
            var method = context.Request.Method;
            var bodyObj = new
            {
                statusCode = 404,
                error = "NotFoundException",
                message = $"Cannot {method} {path}",
                timestamp = DateTime.UtcNow.ToString("o"),
                path = path
            };
            await context.Response.WriteAsJsonAsync(bodyObj);
        }
    }
    catch (NotFoundException ex)
    {
        context.Response.StatusCode = 404;
        context.Response.ContentType = "application/json";
        var bodyObj = new
        {
            statusCode = 404,
            error = "NotFoundException",
            message = ex.Message,
            details = new { resource = ex.Resource, id = ex.Id },
            timestamp = DateTime.UtcNow.ToString("o"),
            path = context.Request.Path.ToString()
        };
        await context.Response.WriteAsJsonAsync(bodyObj);
    }
    catch (BadRequestException ex)
    {
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        var bodyObj = new
        {
            statusCode = 400,
            error = "BadRequestException",
            message = string.Join(", ", ex.Messages),
            details = ex.Messages,
            timestamp = DateTime.UtcNow.ToString("o"),
            path = context.Request.Path.ToString()
        };
        await context.Response.WriteAsJsonAsync(bodyObj);
    }
    catch (Exception)
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var bodyObj = new
        {
            statusCode = 500,
            error = "Internal Error",
            message = "Internal Server Error",
            timestamp = DateTime.UtcNow.ToString("o"),
            path = context.Request.Path.ToString()
        };
        await context.Response.WriteAsJsonAsync(bodyObj);
    }
});

// Routes
app.MapGet("/users", () =>
{
    var body = new
    {
        statusCode = 200,
        message = "Lấy danh sách thành công (EN: Get all success)",
        data = users.OrderBy(u => u.Id).ToList(),
        timestamp = DateTime.UtcNow.ToString("o")
    };
    return Results.Ok(body);
});

app.MapGet("/users/{id}", (string id) =>
{
    if (!int.TryParse(id, out var parsedId))
    {
        throw new NotFoundException($"User with ID {id} not found", "user", id);
    }

    var user = users.FirstOrDefault(u => u.Id == parsedId);
    if (user == null)
    {
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

app.MapPost("/users", async (HttpContext context) =>
{
    CreateUserRequest? payload = null;
    try
    {
        payload = await context.Request.ReadFromJsonAsync<CreateUserRequest>();
    }
    catch
    {
    }

    if (payload == null)
    {
        payload = new CreateUserRequest();
    }

    var messages = new List<string>();
    if (payload.Name == null || payload.Name.Value.ValueKind != JsonValueKind.String)
    {
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
        throw new BadRequestException(messages);
    }

    var trimmedName = payload.Name.Value.GetString()!.Trim();
    var user = new User { Id = System.Threading.Interlocked.Increment(ref nextId) - 1, Name = trimmedName };
    users.Add(user);

    var body = new
    {
        statusCode = 201,
        message = "Tạo thành công (EN: Create success)",
        data = user,
        timestamp = DateTime.UtcNow.ToString("o")
    };
    return Results.Json(body, statusCode: 201);
});

app.Run();

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CreateUserRequest
{
    public JsonElement? Name { get; set; }
}

public class NotFoundException : Exception
{
    public string Resource { get; }
    public string Id { get; }

    public NotFoundException(string message, string resource, string id) : base(message)
    {
        Resource = resource;
        Id = id;
    }
}

public class BadRequestException : Exception
{
    public List<string> Messages { get; }

    public BadRequestException(List<string> messages)
    {
        Messages = messages;
    }
}
