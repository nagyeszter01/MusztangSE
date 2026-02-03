using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EredmenyController : ControllerBase
    {
        private readonly IEredmenyService _eredmenyService;

        public EredmenyController(IEredmenyService eredmenyService)
        {
            _eredmenyService = eredmenyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Eredmeny>>> GetAllAsync()
        {
            var lista = await _eredmenyService.GetAllEredmenyAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Eredmeny>> GetByIdAsync(int id)
        {
            var eredmeny = await _eredmenyService.GetEredmenyByIdAsync(id);
            return Ok(eredmeny);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateEredmenyAsync([FromBody] Eredmeny eredmeny)
        {
            await _eredmenyService.CreateEredmenyAsync(eredmeny);
            return Ok(eredmeny.Id);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsync([FromBody] Eredmeny eredmeny)
        {
            await _eredmenyService.UpdateEredmenyAsync(eredmeny);
            return Ok(eredmeny.Id);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteByIdAsync(int id)
        {
            await _eredmenyService.DeleteEredmenyAsync(id);
            return NoContent();
        }

    }
}
