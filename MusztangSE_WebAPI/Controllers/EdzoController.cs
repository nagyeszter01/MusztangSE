using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EdzoController : ControllerBase
    {
        private readonly IEdzoService _edzoService;

        public EdzoController(IEdzoService edzoService)
        {
            _edzoService = edzoService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Edzo>>> GetAllAsync()
        {
            var lista = await _edzoService.GetAllEdzoAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Edzo>> GetByIdAsync(int id)
        {
            var edzo = await _edzoService.GetEdzoByIdAsync(id);
            return Ok(edzo);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateAsync([FromBody] Edzo edzo)
        {
            await _edzoService.CreateEdzoAsync(edzo);
            return Ok(edzo.Id);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsync([FromBody] Edzo edzo)
        {
            await _edzoService.UpdateEdzoAsync(edzo);
            return Ok(edzo.Id);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteAsync(int id)
        {
            await _edzoService.DeleteEdzoAsync(id);
            return NoContent();
        }
    }
}
