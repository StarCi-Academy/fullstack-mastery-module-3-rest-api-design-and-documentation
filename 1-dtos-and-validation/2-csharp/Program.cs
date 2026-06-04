using Microsoft.AspNetCore.Http;
using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Port binding
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://*:{port}");

var app = builder.Build();

// In-memory store
var users = new ConcurrentBag<dynamic>();

string NextUniqueShortId()
{
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var rnd = new Random();
    while (true)
    {
        var sb = new System.Text.StringBuilder();
        for (int i = 0; i < 6; i++)
        {
            sb.Append(chars[rnd.Next(chars.Length)]);
        }
        var candidate = sb.ToString();
        bool exists = false;
        foreach (var u in users)
        {
            if (u.id == candidate) exists = true;
        }
        if (!exists) return candidate;
    }
}

app.MapPost("/users", async (HttpContext context) =>
{
    CreateUserRequest? payload = null;
    try
    {
        payload = await context.Request.ReadFromJsonAsync<CreateUserRequest>();
    }
    catch
    {
        // Bind failed
    }

    if (payload == null)
    {
        payload = new CreateUserRequest();
    }

    var messages = new List<string>();

    // Validate name
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

    // Validate email
    if (payload.Email == null || payload.Email.Value.ValueKind != JsonValueKind.String || !payload.Email.Value.GetString()!.Contains("@"))
    {
        messages.Add("Email không hợp lệ (EN: Invalid email)");
    }

    // Validate age
    if (payload.Age == null || payload.Age.Value.ValueKind != JsonValueKind.Number)
    {
        messages.Add("age must be an integer number");
        messages.Add("age must not be less than 18");
        messages.Add("age must not be greater than 100");
    }
    else
    {
        try
        {
            double val = payload.Age.Value.GetDouble();
            if (val != Math.Floor(val) || double.IsInfinity(val))
            {
                messages.Add("age must be an integer number");
            }
            if (val < 18)
            {
                messages.Add("age must not be less than 18");
            }
            if (val > 100)
            {
                messages.Add("age must not be greater than 100");
            }
        }
        catch
        {
            messages.Add("age must be an integer number");
            messages.Add("age must not be less than 18");
            messages.Add("age must not be greater than 100");
        }
    }

    // Validate address (optional)
    if (payload.Address != null)
    {
        // Validate city
        string city = "";
        if (payload.Address.City != null && payload.Address.City.Value.ValueKind == JsonValueKind.String)
        {
            city = payload.Address.City.Value.GetString() ?? "";
        }
        if (string.IsNullOrEmpty(city) || city.Length < 2 || city.Length > 100)
        {
            messages.Add("address.City phải dài 2-100 ký tự (EN: city must be 2-100 chars)");
        }

        // Validate zip
        string zip = "";
        if (payload.Address.Zip != null && payload.Address.Zip.Value.ValueKind == JsonValueKind.String)
        {
            zip = payload.Address.Zip.Value.GetString() ?? "";
        }
        if (string.IsNullOrEmpty(zip) || !Regex.IsMatch(zip, @"^\d{4,10}$"))
        {
            messages.Add("address.ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)");
        }
    }

    if (messages.Count > 0)
    {
        return Results.Json(new { statusCode = 400, message = messages, error = "Bad Request" }, statusCode: 400);
    }

    var id = NextUniqueShortId();
    string nameStr = payload.Name.Value.GetString()!;
    string emailStr = payload.Email.Value.GetString()!;
    int ageInt = payload.Age.Value.GetInt32();

    object? addressObj = null;
    if (payload.Address != null)
    {
        addressObj = new
        {
            city = payload.Address.City.Value.GetString()!,
            zip = payload.Address.Zip.Value.GetString()!
        };
    }

    var user = new { id, name = nameStr, email = emailStr, age = ageInt, address = addressObj };
    users.Add(user);

    return Results.Json(user, statusCode: 201);
});

app.MapGet("/users", (HttpContext context) =>
{
    int page = 1;
    int limit = 10;
    if (context.Request.Query.TryGetValue("page", out var pStr))
    {
        int.TryParse(pStr, out page);
    }
    if (context.Request.Query.TryGetValue("limit", out var lStr))
    {
        int.TryParse(lStr, out limit);
    }
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    var orderedList = users.OrderBy(u => (string)u.id).ToList();
    var pagedList = orderedList.Skip((page - 1) * limit).Take(limit).ToList();
    return Results.Ok(pagedList);
});

app.Run();

public class CreateUserRequest
{
    public JsonElement? Name { get; set; }
    public JsonElement? Email { get; set; }
    public JsonElement? Age { get; set; }
    public AddressRequest? Address { get; set; }
}

public class AddressRequest
{
    public JsonElement? City { get; set; }
    public JsonElement? Zip { get; set; }
}
