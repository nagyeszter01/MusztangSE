using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE.Library.MODEL;
using MusztangSE_WebAPI.INTERFACE;


namespace MusztangSE_WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CsapatController : ControllerBase
    {
        private readonly ICsapatService _csapatService;

        public CsapatController(ICsapatService csapatService)
        {
            _csapatService = csapatService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Csapat>>> GetAllAsync()
        {
            var lista = await _csapatService.GetAllCsapatAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Csapat>> GetByIdAsync(int id)
        {
            var csapat = await _csapatService.GetCsapatByIdAsync(id);
            return Ok(csapat);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateAsync([FromBody] Csapat csapat)
        {
            await _csapatService.CreateCsapatAsync(csapat);
            return Ok(csapat.Id);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsync([FromBody] Csapat csapat)
        {
            await _csapatService.UpdateCsapatAsync(csapat);
            return Ok(csapat.Id);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteAsync(int id)
        {
            await _csapatService.DeleteCsapatAsync(id);
            return NoContent();
        }
    }
}
