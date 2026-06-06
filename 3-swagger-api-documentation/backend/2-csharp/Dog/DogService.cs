namespace SwaggerDemo.Dog;

/// <summary>
/// in-memory dog record.
/// </summary>
/// <param name="Name">dog name.</param>
/// <param name="Breed">dog breed.</param>
public record DogRecord(string Name, string Breed);

/// <summary>
/// demo dog business logic — list-only, sufficient for a separate Swagger tag.
/// </summary>
public class DogService
{
    private readonly List<DogRecord> _dogs = new()
    {
        new DogRecord("Rex", "Labrador"),
    };

    /// <summary>
    /// returns all demo dogs.
    /// </summary>
    /// <returns>array of dog records.</returns>
    public IReadOnlyList<DogRecord> FindAll() => _dogs;
}
