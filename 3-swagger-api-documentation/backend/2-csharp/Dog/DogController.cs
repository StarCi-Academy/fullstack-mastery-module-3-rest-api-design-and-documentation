using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using SwaggerDemo.Common;

namespace SwaggerDemo.Dog;

/// <summary>
/// <c>/dogs</c> surface for a second Swagger tag demonstrating route grouping.
/// </summary>
[ApiController]
[Route("dogs")]
[SwaggerTag("Dogs Module")]
public class DogController : ControllerBase
{
    private readonly DogService _dogService;

    /// <summary>
    /// Injects <c>DogService</c> via the constructor.
    /// </summary>
    /// <param name="dogService">dog business service.</param>
    public DogController(DogService dogService) => _dogService = dogService;

    /// <summary>
    /// returns the list of demo dogs.
    /// </summary>
    /// <returns>array of dog records inside the envelope.</returns>
    [HttpGet]
    [SwaggerOperation(Summary = "Retrieve all dogs")]
    [ProducesResponseType(typeof(IReadOnlyList<DogRecord>), StatusCodes.Status200OK)]
    [ResponseMessage("Lấy danh sách chó thành công (EN: Get all dogs success)")]
    public ActionResult<IReadOnlyList<DogRecord>> FindAll()
        => Ok(_dogService.FindAll());
}
