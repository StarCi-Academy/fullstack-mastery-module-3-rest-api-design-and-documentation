using Microsoft.EntityFrameworkCore;
using CrudApp;

// Build the ASP.NET Core WebApplication with all services registered before app.Build().
var builder = WebApplication.CreateBuilder(args);

// Read PORT from environment or default to 3000.
// Bind to 127.0.0.1 (loopback only) so Windows Defender Firewall does not
// prompt for inbound access — binding to 0.0.0.0/* triggers a UAC popup that
// blocks the process in non-interactive (agent / CI) environments.
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://127.0.0.1:{port}");

// Read PostgreSQL connection parameters from environment variables so the
// same binary works against any Postgres instance (local Docker or cloud).
var pgHost = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
var pgPort = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
var pgUser = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
var pgPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgres";
var pgDb = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "restful_demo";

// Build the Npgsql connection string from individual components.
var connectionString = $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPass};";

// Register AppDbContext with EF Core / Npgsql — scoped lifetime (per HTTP request).
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

// On startup, create the schema if it does not exist (EnsureCreated is idempotent).
// For production use EF migrations instead; EnsureCreated is sufficient for demos.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Apply any pending schema creation before the first request arrives.
    db.Database.EnsureCreated();
}

/// <summary>
/// Generates a 5-character alphanumeric ID that does not already exist in the DB.
/// Retries up to 32 times before throwing — collision probability is negligible
/// for small datasets but the retry cap prevents an infinite loop on anomalous data.
/// </summary>
/// <param name="db">Active EF Core context used to check for duplicate IDs.</param>
/// <returns>A unique 5-character lowercase alphanumeric string.</returns>
string NextUniqueShortId(AppDbContext db)
{
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var rnd = new Random();
    for (int i = 0; i < 32; i++)
    {
        var sb = new System.Text.StringBuilder();
        for (int j = 0; j < 5; j++)
        {
            // Pick a random character from the allowed alphabet.
            sb.Append(chars[rnd.Next(chars.Length)]);
        }
        var candidate = sb.ToString();
        // Only return the candidate when it is not already used as an ID.
        if (!db.Users.Any(u => u.Id == candidate))
        {
            return candidate;
        }
    }
    throw new Exception("Failed to allocate unique user id after retries");
}

// --- Demo utility routes (not part of the REST CRUD contract) ---

// DELETE /users/demo/clear-all — wipe all rows for a clean lesson state.
// Returns 204 No Content to signal success without a response body.
app.MapDelete("/users/demo/clear-all", async (AppDbContext db) =>
{
    // ExecuteDeleteAsync issues a single DELETE FROM users — no row tracking overhead.
    await db.Users.ExecuteDeleteAsync();
    return Results.NoContent();
});

// POST /users/demo/seed-one — insert one fixed demo user to pre-populate read flows.
// Returns 201 Created + the seeded user JSON.
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
    // Location header points to the canonical GET URL for this resource.
    return Results.Created($"/users/{user.Id}", user);
});

// --- RESTful CRUD routes ---

// GET /users — return all users ordered by id ascending.
// Empty array is a valid response when no users exist (never 404).
app.MapGet("/users", async (AppDbContext db) =>
{
    // OrderBy ensures deterministic output for testing.
    var list = await db.Users.OrderBy(u => u.Id).ToListAsync();
    return Results.Ok(list);
});

// GET /users/{id} — fetch one user by id.
// Returns 200 + user JSON if found; 404 with problem JSON if not found.
app.MapGet("/users/{id}", async (string id, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        // Match the error shape expected by the lesson contract.
        return Results.Json(new { statusCode = 404, message = $"User with ID {id} not found", error = "Not Found" }, statusCode: 404);
    }
    return Results.Ok(user);
});

// POST /users — create a new user from the request body.
// Returns 201 Created + the new resource; id is assigned server-side.
app.MapPost("/users", async (HttpContext context, AppDbContext db) =>
{
    // Read the JSON body as a generic dictionary so we can handle missing fields gracefully.
    var payload = await context.Request.ReadFromJsonAsync<Dictionary<string, object>>();
    var id = NextUniqueShortId(db);

    // Fall back to safe defaults when optional fields are missing from the body.
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

// PUT /users/{id} — full replacement; ALL fields are overwritten from the body.
// Returns 200 + updated user; 404 if id not found.
app.MapPut("/users/{id}", async (string id, HttpContext context, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.Json(new { statusCode = 404, message = $"User with ID {id} not found", error = "Not Found" }, statusCode: 404);
    }

    var payload = await context.Request.ReadFromJsonAsync<Dictionary<string, object>>();
    // PUT replaces both fields unconditionally; missing fields become empty strings.
    var name = payload != null && payload.TryGetValue("name", out var n) && n != null ? n.ToString() : string.Empty;
    var email = payload != null && payload.TryGetValue("email", out var e) && e != null ? e.ToString() : string.Empty;

    user.Name = name!;
    user.Email = email!;

    await db.SaveChangesAsync();
    return Results.Ok(user);
});

// PATCH /users/{id} — partial update; only fields present in the body are changed.
// Returns 200 + updated user; 404 if id not found.
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
        // Only overwrite the field if the key is present in the payload (PATCH semantics).
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

// DELETE /users/{id} — remove user by id.
// Returns 204 No Content on success; 404 if not found.
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

// Start the application; UseUrls above already set the listen address.
app.Run();
