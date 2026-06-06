// DTOs and Validation demo — ASP.NET Core Minimal API (C#)
//
// Demonstrates boundary validation in C#: every POST /users request is validated
// field-by-field before any user is created. Validation errors are collected into
// a message list and returned as HTTP 400 if any constraint fails.
// The in-memory store (ConcurrentBag<dynamic>) replaces a real database.

using Microsoft.AspNetCore.Http;
using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Read the port from the PORT environment variable so the server can be remapped
// at runtime without changing source code. Default to 3000 for local development.
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
// UseUrls binds the server to all network interfaces on the given port.
// For local-only testing you can swap "*" for "127.0.0.1".
builder.WebHost.UseUrls($"http://*:{port}");

var app = builder.Build();

// Thread-safe in-memory collection acting as the user store for this demo.
// ConcurrentBag allows concurrent writes without explicit locking.
var users = new ConcurrentBag<dynamic>();

/// <summary>
/// Generate a collision-free 6-character alphanumeric id for a new user.
/// Retries until a candidate not already in <paramref name="users"/> is found.
/// The loop is unbounded because the id space is enormous relative to demo usage.
/// </summary>
/// <returns>A unique 6-character lowercase alphanumeric string.</returns>
string NextUniqueShortId()
{
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var rnd = new Random();
    while (true)
    {
        // Build a 6-character random string from the allowed character set.
        var sb = new System.Text.StringBuilder();
        for (int i = 0; i < 6; i++)
        {
            sb.Append(chars[rnd.Next(chars.Length)]);
        }
        var candidate = sb.ToString();

        // Check whether any existing user already holds this id.
        bool exists = false;
        foreach (var u in users)
        {
            if (u.id == candidate) exists = true;
        }

        // Return immediately when the candidate is free.
        if (!exists) return candidate;
    }
}

// POST /users — create a new user after validating the request body at the boundary.
app.MapPost("/users", async (HttpContext context) =>
{
    // Deserialise the request body into a typed container.
    // JsonElement? fields allow us to distinguish "field absent" from "field null"
    // and to inspect the JSON kind (string, number, etc.) before converting.
    CreateUserRequest? payload = null;
    try
    {
        payload = await context.Request.ReadFromJsonAsync<CreateUserRequest>();
    }
    catch
    {
        // Ignore parse errors — payload stays null and we treat all fields as missing.
    }

    // Use an empty request if the body was malformed or absent.
    if (payload == null)
    {
        payload = new CreateUserRequest();
    }

    // Collect all validation errors before deciding to accept or reject the request.
    var messages = new List<string>();

    // --- Validate name ---
    if (payload.Name == null || payload.Name.Value.ValueKind != JsonValueKind.String)
    {
        // name is absent or not a JSON string — report type and length errors together.
        messages.Add("name must be a string");
        messages.Add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
    }
    else
    {
        var name = payload.Name.Value.GetString() ?? "";
        if (name.Length < 3)
        {
            // name is a string but shorter than the 3-character minimum.
            messages.Add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
        }
    }

    // --- Validate email ---
    if (payload.Email == null || payload.Email.Value.ValueKind != JsonValueKind.String
        || !payload.Email.Value.GetString()!.Contains("@"))
    {
        // Simple "@" presence check mirrors the demo constraint used in all language variants.
        messages.Add("Email không hợp lệ (EN: Invalid email)");
    }

    // --- Validate age ---
    if (payload.Age == null || payload.Age.Value.ValueKind != JsonValueKind.Number)
    {
        // age is absent or not a JSON number — report all numeric constraints.
        messages.Add("age must be an integer number");
        messages.Add("age must not be less than 18");
        messages.Add("age must not be greater than 100");
    }
    else
    {
        try
        {
            double val = payload.Age.Value.GetDouble();
            // Reject fractional values (e.g. 25.5) — age must be a whole number.
            if (val != Math.Floor(val) || double.IsInfinity(val))
            {
                messages.Add("age must be an integer number");
            }
            // Check lower bound.
            if (val < 18)
            {
                messages.Add("age must not be less than 18");
            }
            // Check upper bound.
            if (val > 100)
            {
                messages.Add("age must not be greater than 100");
            }
        }
        catch
        {
            // GetDouble() threw — the number is out of range or otherwise unreadable.
            messages.Add("age must be an integer number");
            messages.Add("age must not be less than 18");
            messages.Add("age must not be greater than 100");
        }
    }

    // --- Validate address (optional nested object) ---
    if (payload.Address != null)
    {
        // Validate nested city — must be a string of 2-100 characters.
        string city = "";
        if (payload.Address.City != null && payload.Address.City.Value.ValueKind == JsonValueKind.String)
        {
            city = payload.Address.City.Value.GetString() ?? "";
        }
        if (string.IsNullOrEmpty(city) || city.Length < 2 || city.Length > 100)
        {
            messages.Add("address.City phải dài 2-100 ký tự (EN: city must be 2-100 chars)");
        }

        // Validate nested zip — must match 4-10 digit pattern.
        string zip = "";
        if (payload.Address.Zip != null && payload.Address.Zip.Value.ValueKind == JsonValueKind.String)
        {
            zip = payload.Address.Zip.Value.GetString() ?? "";
        }
        if (string.IsNullOrEmpty(zip) || !Regex.IsMatch(zip, @"^\d{4,10}$"))
        {
            // The "address." prefix mirrors the NestJS nested path convention for consistency.
            messages.Add("address.ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)");
        }
    }

    // --- Boundary gate: reject immediately if any error exists ---
    if (messages.Count > 0)
    {
        // Return 400 with the full error list — no user is created.
        return Results.Json(new { statusCode = 400, message = messages, error = "Bad Request" }, statusCode: 400);
    }

    // --- All constraints passed — persist the new user ---
    var id = NextUniqueShortId();
    // GetString() / GetInt32() are safe here because we validated the kinds above.
    string nameStr = payload.Name!.Value.GetString()!;
    string emailStr = payload.Email!.Value.GetString()!;
    int ageInt = payload.Age!.Value.GetInt32();

    // Build the optional address object only when the client supplied one.
    object? addressObj = null;
    if (payload.Address != null)
    {
        addressObj = new
        {
            city = payload.Address.City!.Value.GetString()!,
            zip = payload.Address.Zip!.Value.GetString()!
        };
    }

    // Create an anonymous object so the response JSON exactly matches the spec shape.
    var user = new { id, name = nameStr, email = emailStr, age = ageInt, address = addressObj };
    users.Add(user);

    // Return 201 Created with the full user record including the generated id.
    return Results.Json(user, statusCode: 201);
});

// GET /users — return a paginated list of users.
app.MapGet("/users", (HttpContext context) =>
{
    // Parse page and limit from query string — string-to-int coercion is manual in C# Minimal API.
    int page = 1;
    int limit = 10;
    if (context.Request.Query.TryGetValue("page", out var pStr))
    {
        // int.TryParse returns false on failure and leaves `page` at its default.
        int.TryParse(pStr, out page);
    }
    if (context.Request.Query.TryGetValue("limit", out var lStr))
    {
        int.TryParse(lStr, out limit);
    }

    // Clamp invalid values to safe defaults.
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    // Sort by id for stable, deterministic pagination across calls.
    var orderedList = users.OrderBy(u => (string)u.id).ToList();
    // Apply SKIP/TAKE (OFFSET/LIMIT) for the requested page.
    var pagedList = orderedList.Skip((page - 1) * limit).Take(limit).ToList();
    return Results.Ok(pagedList);
});

app.Run();

// ---- Request model types ----

/// <summary>
/// Raw request body for POST /users.
/// Fields use <c>JsonElement?</c> so we can inspect JSON kinds before converting,
/// enabling accurate per-field error messages (type error vs constraint error).
/// </summary>
public class CreateUserRequest
{
    /// <summary>User's display name — validated for type and minimum length.</summary>
    public JsonElement? Name { get; set; }

    /// <summary>User's email address — validated to contain "@".</summary>
    public JsonElement? Email { get; set; }

    /// <summary>User's age — validated to be a whole number in [18, 100].</summary>
    public JsonElement? Age { get; set; }

    /// <summary>Optional postal address — validated recursively when present.</summary>
    public AddressRequest? Address { get; set; }
}

/// <summary>
/// Nested address sub-object inside <see cref="CreateUserRequest"/>.
/// Both city and zip use <c>JsonElement?</c> for the same reason as the parent.
/// </summary>
public class AddressRequest
{
    /// <summary>City or locality name — must be 2-100 characters.</summary>
    public JsonElement? City { get; set; }

    /// <summary>Postal ZIP code — must match 4-10 digit pattern.</summary>
    public JsonElement? Zip { get; set; }
}
