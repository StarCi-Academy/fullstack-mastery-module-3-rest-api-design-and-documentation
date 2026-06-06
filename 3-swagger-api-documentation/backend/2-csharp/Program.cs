using Microsoft.OpenApi.Models;
using SwaggerDemo.Cat;
using SwaggerDemo.Dog;
using SwaggerDemo.Common;

// WebApplication.CreateBuilder sets up configuration, logging, and DI container.
var builder = WebApplication.CreateBuilder(args);

// Allow the port to be overridden via the PORT environment variable (useful for e2e parallel runs).
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://*:{port}");

// Register domain services as Singleton so the in-memory store is shared across requests.
builder.Services.AddSingleton<CatService>();
builder.Services.AddSingleton<DogService>();

// EnvelopeResultFilter wraps 2xx ObjectResult values in {statusCode, message, data, timestamp}.
// ValidationProblem.Build replaces the default 400 ProblemDetails with the lesson error envelope.
builder.Services.AddControllers(options =>
{
    options.Filters.Add<EnvelopeResultFilter>();
})
.ConfigureApiBehaviorOptions(options =>
{
    // Override the automatic 400 response factory so validation errors follow the same
    // unified envelope structure as other error types.
    options.InvalidModelStateResponseFactory = ValidationProblem.Build;
});

// AddEndpointsApiExplorer tells the spec generator to scan Minimal API endpoints too.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Document metadata shown at the top of the Swagger UI page.
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "StarCi Academy Backend",
        Description = "API documentation for the REST API Design & Documentation lesson",
        Version = "1.0"
    });
    // EnableAnnotations activates [SwaggerOperation] / [SwaggerResponse] on controllers.
    c.EnableAnnotations();

    // Include XML doc comments (/// <summary>) in the spec so field descriptions appear in the UI.
    // The project file must have <GenerateDocumentationFile>true</GenerateDocumentationFile>.
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Declare the "bearer" HTTP security scheme so the UI renders the Authorize button.
    c.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });

    // Apply the security requirement globally to every operation in this document.
    // Individual operations can override with [AllowAnonymous] / empty security list.
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "bearer"
                }
            },
            Array.Empty<string>()   // empty array = no specific scopes required
        }
    });
});

var app = builder.Build();

// Alias middleware: rewrite /swagger-json → /swagger/v1/swagger.json and
// /swagger → /swagger/index.html so all four lang backends share the same URL surface.
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value;
    if (path == "/swagger-json")
    {
        // Internal rewrite — no round-trip to client; Swashbuckle serves the rewritten path.
        context.Request.Path = "/swagger/v1/swagger.json";
    }
    else if (path == "/swagger")
    {
        // Redirect so the browser updates its address bar to the canonical Swashbuckle UI path.
        context.Response.Redirect("/swagger/index.html");
        return;
    }
    await next();
});

// Custom Exception and 404 Route Not Found handling
app.Use(async (context, next) =>
{
    try
    {
        await next();
        if (context.Response.StatusCode == 404 && !context.Response.HasStarted)
        {
            context.Response.ContentType = "application/json";
            var requestPath = context.Request.Path.Value;
            var method = context.Request.Method;
            await context.Response.WriteAsJsonAsync(new
            {
                statusCode = 404,
                error = "NotFoundException",
                message = $"Cannot {method} {requestPath}",
                timestamp = DateTime.UtcNow.ToString("o"),
                path = requestPath
            });
        }
    }
    catch (System.ComponentModel.DataAnnotations.ValidationException ex)
    {
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        var requestPath = context.Request.Path.Value;
        await context.Response.WriteAsJsonAsync(new
        {
            statusCode = 400,
            error = "BadRequestException",
            message = ex.Message,
            timestamp = DateTime.UtcNow.ToString("o"),
            path = requestPath
        });
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var requestPath = context.Request.Path.Value;
        await context.Response.WriteAsJsonAsync(new
        {
            statusCode = 500,
            error = "Internal Error",
            message = ex.Message,
            timestamp = DateTime.UtcNow.ToString("o"),
            path = requestPath
        });
    }
});

app.UseSwagger(c =>
{
    c.RouteTemplate = "swagger/{documentName}/swagger.json";
});

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "StarCi Academy Backend v1");
    c.RoutePrefix = "swagger";
});

app.MapControllers();

app.Run();
