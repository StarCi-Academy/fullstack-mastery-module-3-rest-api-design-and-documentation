using Microsoft.EntityFrameworkCore;
using CrudApp;

var builder = WebApplication.CreateBuilder(args);

// Read PORT from environment or default to 3000
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://*:{port}");

// Configure EF Core with PostgreSQL using Environment Variables
var pgHost = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
var pgPort = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
var pgUser = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
var pgPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgres";
var pgDb = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "restful_demo";

var connectionString = $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPass};";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

// Auto-run migrations or ensure DB is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

string NextUniqueShortId(AppDbContext db)
{
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var rnd = new Random();
    for (int i = 0; i < 32; i++)
    {
        var sb = new System.Text.StringBuilder();
        for (int j = 0; j < 5; j++)
        {
            sb.Append(chars[rnd.Next(chars.Length)]);
        }
        var candidate = sb.ToString();
        if (!db.Users.Any(u => u.Id == candidate))
        {
            return candidate;
        }
    }
    throw new Exception("Failed to allocate unique user id after retries");
}

// Routes
app.MapDelete("/users/demo/clear-all", async (AppDbContext db) =>
{
    await db.Users.ExecuteDeleteAsync();
    return Results.NoContent();
});

app.MapPost("/users/demo/seed-one", async (AppDbContext db) =>
{
    var id = NextUniqueShortId(db);
    var user = new User
    {
        Id = id,
        Name = "Chelsea Koelpin",
        Email = "Chelsea_Wolf@hotmail.com"
    };
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/users/{user.Id}", user);
});

app.MapGet("/users", async (AppDbContext db) =>
{
    var list = await db.Users.OrderBy(u => u.Id).ToListAsync();
    return Results.Ok(list);
});

app.MapGet("/users/{id}", async (string id, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.Json(new { statusCode = 404, message = $"User with ID {id} not found", error = "Not Found" }, statusCode: 404);
    }
    return Results.Ok(user);
});

app.MapPost("/users", async (HttpContext context, AppDbContext db) =>
{
    var payload = await context.Request.ReadFromJsonAsync<Dictionary<string, object>>();
    var id = NextUniqueShortId(db);
    
    var name = payload != null && payload.TryGetValue("name", out var n) && n != null ? n.ToString() : "Anonymous";
    var email = payload != null && payload.TryGetValue("email", out var e) && e != null ? e.ToString() : "no-email@example.com";
    
    var user = new User
    {
        Id = id,
        Name = name!,
        Email = email!
    };
    
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/users/{user.Id}", user);
});

app.MapPut("/users/{id}", async (string id, HttpContext context, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.Json(new { statusCode = 404, message = $"User with ID {id} not found", error = "Not Found" }, statusCode: 404);
    }
    
    var payload = await context.Request.ReadFromJsonAsync<Dictionary<string, object>>();
    var name = payload != null && payload.TryGetValue("name", out var n) && n != null ? n.ToString() : string.Empty;
    var email = payload != null && payload.TryGetValue("email", out var e) && e != null ? e.ToString() : string.Empty;
    
    user.Name = name!;
    user.Email = email!;
    
    await db.SaveChangesAsync();
    return Results.Ok(user);
});

app.MapPatch("/users/{id}", async (string id, HttpContext context, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.Json(new { statusCode = 404, message = $"User with ID {id} not found", error = "Not Found" }, statusCode: 404);
    }
    
    var payload = await context.Request.ReadFromJsonAsync<Dictionary<string, object>>();
    if (payload != null)
    {
        if (payload.TryGetValue("name", out var n))
        {
            user.Name = n != null ? n.ToString()! : string.Empty;
        }
        if (payload.TryGetValue("email", out var e))
        {
            user.Email = e != null ? e.ToString()! : string.Empty;
        }
    }
    
    await db.SaveChangesAsync();
    return Results.Ok(user);
});

app.MapDelete("/users/{id}", async (string id, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.Json(new { statusCode = 404, message = "Cannot delete: User not found", error = "Not Found" }, statusCode: 404);
    }
    
    db.Users.Remove(user);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
