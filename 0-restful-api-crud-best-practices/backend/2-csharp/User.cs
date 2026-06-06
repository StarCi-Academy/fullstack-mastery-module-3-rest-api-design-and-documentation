using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CrudApp;

/// <summary>
/// Represents a User record persisted to the PostgreSQL "users" table.
/// Properties use explicit [Column] names to map PascalCase C# names to
/// lowercase PostgreSQL column names (EF Core default convention quotes
/// PascalCase, causing "column does not exist" errors on case-sensitive Postgres).
/// </summary>
public class User
{
    /// <summary>Application-assigned short alphanumeric primary key.</summary>
    [Column("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>Display name of the user; required field.</summary>
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>Unique email address of the user; required field.</summary>
    [Column("email")]
    public string Email { get; set; } = string.Empty;
}
