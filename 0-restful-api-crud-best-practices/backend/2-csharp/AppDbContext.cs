using Microsoft.EntityFrameworkCore;

namespace CrudApp;

/// <summary>
/// EF Core database context for the CRUD demo application.
/// Registers the Users entity set and configures the "users" table mapping.
/// PostgreSQL (via Npgsql) is used as the underlying database provider.
/// </summary>
public class AppDbContext : DbContext
{
    /// <summary>
    /// Initializes the context with the given DbContextOptions.
    /// Options are injected by the ASP.NET Core DI container from Program.cs.
    /// </summary>
    /// <param name="options">EF Core options (connection string, provider, etc.).</param>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    /// <summary>
    /// DbSet for the User entity; maps to the "users" table.
    /// Accessed via LINQ queries and EF Core tracking.
    /// </summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>
    /// Configures entity mappings beyond conventions.
    /// Explicitly sets the table name and maps property names to lowercase column names
    /// so EF Core does not quote PascalCase names (which PostgreSQL treats as case-sensitive).
    /// </summary>
    /// <param name="modelBuilder">Fluent API builder for entity configuration.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            // Map to lowercase table name so PostgreSQL finds it without quoting.
            entity.ToTable("users");

            // Declare Id as primary key and set max length to match varchar(36) column.
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").HasMaxLength(36);

            // Map Name and Email to lowercase column names; both are required.
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        });
    }
}
