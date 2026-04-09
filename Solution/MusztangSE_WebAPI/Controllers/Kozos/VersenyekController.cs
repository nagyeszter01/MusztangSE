using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.SERVICES;
using MusztangSE.Library.DATA;


namespace MusztangSE_WebAPI.Controllers.Kozos
{
    [ApiController]
    [Route("api/shared/versenyek")]
    [Authorize(Roles = "tag,edzo,admin")]
    public class VersenyekController : ControllerBase
    {
        private readonly VersenyService _versenyService;
        private readonly ApplicationDbContext _context;

        public VersenyekController(VersenyService versenyService, ApplicationDbContext context)
        {
            _versenyService = versenyService;
            _context = context;
        }

        [HttpGet("kozelgo")]
        public async Task<IActionResult> GetUpcoming()
        {
            var versenyek = await _versenyService.GetUpcomingAsync();
            return Ok(versenyek);
        }

        [HttpGet("ev/{ev}")]
        public async Task<IActionResult> GetByEv(int ev)
        {
            var versenyek = await _context.Versenyek
                .Where(v => v.Datum.Year == ev)
                .OrderBy(v => v.Datum)
                .Select(v => new { v.Id, v.Nev, v.Datum, v.Hely })
                .ToListAsync();
            return Ok(versenyek);
        }
    }
}
