using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using SwaggerDemo.Common;

namespace SwaggerDemo.Cat;

/// <summary>
/// <c>/cats</c> HTTP surface with OpenAPI attributes that describe each operation in the spec.
/// </summary>
[ApiController]
[Route("cats")]
[SwaggerTag("Cats Module")]
public class CatController : ControllerBase
{
    private readonly CatService _catService;

    /// <summary>
    /// Injects <c>CatService</c> via the constructor.
    /// </summary>
    /// <param name="catService">cat business service.</param>
    public CatController(CatService catService) => _catService = catService;

    /// <summary>
    /// returns the list of cats.
    /// </summary>
    /// <returns>array of cat records inside the envelope.</returns>
    [HttpGet]
    [SwaggerOperation(Summary = "Retrieve all cats")]
    [ProducesResponseType(typeof(IReadOnlyList<CatRecord>), StatusCodes.Status200OK)]
    [ResponseMessage("Lấy danh sách mèo thành công (EN: Get all cats success)")]
    public ActionResult<IReadOnlyList<CatRecord>> FindAll()
        => Ok(_catService.FindAll());

    /// <summary>
    /// creates a cat from the validated DTO.
    /// </summary>
    /// <param name="dto">request body matching <c>CreateCatDto</c>.</param>
    /// <returns>the newly created record with HTTP 201.</returns>
    [HttpPost]
    [SwaggerOperation(Summary = "Create a new cat")]
    [SwaggerResponse(StatusCodes.Status201Created, "Cat created")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid payload")]
    public ActionResult<CatRecord> Create([FromBody] CreateCatDto dto)
        => StatusCode(StatusCodes.Status201Created, _catService.Create(dto));

    /// <summary>
    /// Demo error response (Bad Request).
    /// </summary>
    [HttpGet("error-demo")]
    [SwaggerOperation(Summary = "Demo error response (Bad Request)")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult ErrorDemo()
    {
        throw new System.ComponentModel.DataAnnotations.ValidationException("Đây là lỗi giả lập để test Unified Error Response");
    }
}
