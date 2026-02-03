using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagCsapatController : ControllerBase
    {
        private readonly ITagCsapatService _tagCsapatService;

        public TagCsapatController(ITagCsapatService tagCsapatService)
        {
            _tagCsapatService = tagCsapatService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TagCsapat>>> GetAllAsync()
        {
            var lista = await _tagCsapatService.GetAllTagCsapatAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<TagCsapat>> GetByIdAsync(int id)
        {
            var tagCsapat = await _tagCsapatService.GetTagCsapatByIdAsync(id);
            return Ok(tagCsapat);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateAsync([FromBody] TagCsapat tagCsapat)
        {
            await _tagCsapatService.CreateTagCsapatAsync(tagCsapat);
            return Ok(tagCsapat.Id);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteAsync(int id)
        {
            await _tagCsapatService.DeleteTagCsapatAsync(id);
            return NoContent();
        }
    }
}
