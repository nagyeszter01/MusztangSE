using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusztangSE_WebAPI.SERVICES;
using MusztangSe.Library.DTOs.Verseny;
namespace MusztangSE_WebAPI.Controllers.Edzo
{
    [ApiController]
    [Route("api/coach/versenyek")]
    [Authorize(Roles = "edzo,admin")]
    public class VersenyekController : ControllerBase
    {
        private readonly VersenyService _versenyService;

        public VersenyekController(VersenyService versenyService)
            => _versenyService = versenyService;

        [HttpGet("kozelgo")]
        public async Task<IActionResult> GetUpcoming()
        {
            var versenyek = await _versenyService.GetUpcomingAsync();
            return Ok(versenyek);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VersenyCreateDto dto)
        {
            var verseny = await _versenyService.CreateAsync(dto);
            return Ok(verseny);
        }
    }
}
