using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusztangSE.Library.DATA;
using Microsoft.EntityFrameworkCore;


namespace MusztangSE_WebAPI.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminDashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetStats()
        {
            var osszesTago = await _context.Tagok.CountAsync();
            var edzokSzama = await _context.Edzo.CountAsync();
            var csapatokSzama = await _context.Csapat.CountAsync();
            var kozelgoVersenyek = await _context.Versenyek
                .CountAsync(v => v.Datum >= DateTime.UtcNow);

            return Ok(new
            {
                osszesTago,
                edzokSzama,
                csapatokSzama,
                kozelgoVersenyek
            });
        }
    }
}
