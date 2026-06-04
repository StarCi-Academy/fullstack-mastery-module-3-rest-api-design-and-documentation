using Microsoft.OpenApi.Models;
using SwaggerDemo.Cat;
using SwaggerDemo.Dog;
using SwaggerDemo.Common;

var builder = WebApplication.CreateBuilder(args);

// Port binding
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://*:{port}");

// Add services
builder.Services.AddSingleton<CatService>();
builder.Services.AddSingleton<DogService>();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<EnvelopeResultFilter>();
})
.ConfigureApiBehaviorOptions(options =>
{
    options.InvalidModelStateResponseFactory = ValidationProblem.Build;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "StarCi Academy Backend",
        Description = "API documentation for the REST API Design & Documentation lesson",
        Version = "1.0"
    });
    c.EnableAnnotations();

    // Enable XML documentation integration
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Configure Bearer Authentication
    c.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });

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
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Middleware to rewrite /swagger-json and /swagger internally
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value;
    if (path == "/swagger-json")
    {
        context.Request.Path = "/swagger/v1/swagger.json";
    }
    else if (path == "/swagger")
    {
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
