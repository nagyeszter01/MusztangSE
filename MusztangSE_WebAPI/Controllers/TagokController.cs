using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagokController : ControllerBase
    {
        private readonly ITagokService _tagService;
        public TagokController(ITagokService tagService)
        {
            _tagService = tagService;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tagok>>> GetAllAsnyc()
        {
            var lista = await _tagService.GetAllTagAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Tagok>> GetByIdAsync(int id)
        {
            var tag = await _tagService.GetTagByIdAsync(id);
            return Ok(tag);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateTagAsync([FromBody] Tagok tag)
        {
            await _tagService.CreateTagAsync(tag);
            return Ok(tag.Id);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsync([FromBody] Tagok tag)
        {
            await _tagService.UpdateTagAsync(tag);
            return Ok(tag.Id);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteByIdAsync(int id)
        {
            await _tagService.DeleteTagAsync(id);
            return NoContent();
        }
    }
}
