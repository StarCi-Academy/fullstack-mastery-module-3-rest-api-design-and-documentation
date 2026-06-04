namespace SwaggerDemo.Cat;

/// <summary>
/// in-memory cat record matching the lesson <c>GET /cats</c> sample.
/// </summary>
/// <param name="Name">cat name.</param>
/// <param name="Age">cat age.</param>
public record CatRecord(string Name, int Age);

/// <summary>
/// demo cat business logic — list and create.
/// </summary>
public class CatService
{
    private readonly List<CatRecord> _cats = new()
    {
        new CatRecord("Milo", 3),
    };

    /// <summary>
    /// returns all demo cats.
    /// </summary>
    /// <returns>array of cat records.</returns>
    public IReadOnlyList<CatRecord> FindAll() => _cats;

    /// <summary>
    /// appends a cat; maps DTO <c>Breed</c> to stored <c>Name</c> for this simple demo.
    /// </summary>
    /// <param name="dto">validated payload.</param>
    /// <returns>newly created record.</returns>
    public CatRecord Create(CreateCatDto dto)
    {
        var cat = new CatRecord(dto.Breed, dto.Age);
        _cats.Add(cat);
        return cat;
    }
}
