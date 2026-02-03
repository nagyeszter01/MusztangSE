using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VersenyController : ControllerBase
    {
        private readonly IVersenyService _versenyService;

        public VersenyController(IVersenyService versenyService)
        {
            _versenyService = versenyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Verseny>>> GetAllAsync()
        {
            var lista = await _versenyService.GetAllVersenyAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Verseny>> GetByIdAsync(int id)
        {
            var verseny = await _versenyService.GetVersenyByIdAsync(id);
            return Ok(verseny);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateVersenyAsync([FromBody] Verseny verseny)
        {
            await _versenyService.CreateVersenyAsync(verseny);
            return Ok(verseny.Id);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsync([FromBody] Verseny verseny)
        {
            await _versenyService.UpdateVersenyAsync(verseny);
            return Ok(verseny.Id);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteByIdAsync(int id)
        {
            await _versenyService.DeleteVersenyAsync(id);
            return NoContent();
        }

    }
}
