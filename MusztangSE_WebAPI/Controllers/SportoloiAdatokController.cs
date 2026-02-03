using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;
using MusztangSE_WebAPI.SERVICES;

namespace MusztangSE_WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SportoloiAdatokController : ControllerBase
    {
        private readonly ISportoloiAdatokService _sportoloiAdatokService;

        public SportoloiAdatokController(ISportoloiAdatokService sportoloiAdatokService)
        {
            _sportoloiAdatokService = sportoloiAdatokService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SportoloiAdatok>>> GetAllAsync()
        {
            var lista = await _sportoloiAdatokService.GetAllSportoloiAdatAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Verseny>> GetByIdAsync(int id)
        {
            var sportoloadat = await _sportoloiAdatokService.GetSportoloiAdatByIdAsync(id);
            return Ok(sportoloadat);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateSportoloiAdatAsync([FromBody] SportoloiAdatok sportoloiadat)
        {
            await _sportoloiAdatokService.CreateSportoloiAdatAsync(sportoloiadat);
            return Ok(sportoloiadat.Id);
        }
        [HttpPut]
        public async Task<ActionResult> UpdateSportoloiAdatAsync([FromBody] SportoloiAdatok sportoloiadat)
        {
            await _sportoloiAdatokService.UpdateSportoloiAdatAsync(sportoloiadat);
            return Ok(sportoloiadat.Id);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteByIdAsync(int id)
        {
            await _sportoloiAdatokService.DeleteSportoloiAdatAsync(id);
            return NoContent();
        }
    }
}
