using System.ComponentModel.DataAnnotations;

namespace SwaggerDemo.Cat;

/// <summary>
/// create-cat DTO; data-annotation attributes both describe the OpenAPI schema and enforce the runtime contract.
/// </summary>
public class CreateCatDto
{
    /// <summary>
    /// cat breed — required, becomes <c>properties.breed</c> in the schema.
    /// </summary>
    /// <example>Persian</example>
    [Required]
    public string Breed { get; set; } = string.Empty;

    /// <summary>
    /// cat age in years — required, becomes an integer <c>properties.age</c>.
    /// </summary>
    /// <example>2</example>
    [Required]
    [Range(0, 50)]
    public int Age { get; set; }
}
