using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE_WebAPI.SERVICES;

namespace MusztangSE_WebAPI.Controllers.Public
{
    [Route("api/[controller]")]
    [ApiController]
    public class EredmenyekController : ControllerBase
    {
        private readonly EredmenyService _service;

        public EredmenyekController(EredmenyService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var eredmenyek = await _service.GetAllAsync();
            return Ok(eredmenyek);
        }

        [HttpGet("kozelgo")]
        public async Task<IActionResult> GetUpcoming()
        {
            var eredmenyek = await _service.GetUpcomingAsync();
            return Ok(eredmenyek);
        }
    }
}
