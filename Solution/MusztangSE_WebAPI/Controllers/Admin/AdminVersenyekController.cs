using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Verseny;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers.Admin
{
  
    [ApiController]
    [Route("api/admin/versenyek")]
    [Authorize(Roles = "admin")]
    public class AdminVersenyekController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminVersenyekController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var versenyek = await _context.Versenyek
                .OrderBy(v => v.Datum)
                .Select(v => new { v.Id, v.Nev, v.Datum, v.Hely })
                .ToListAsync();
            return Ok(versenyek);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VersenyDto dto)
        {
            var verseny = new Verseny
            {
                Nev = dto.Nev,
                Datum = DateTime.SpecifyKind(dto.Datum, DateTimeKind.Utc),
                Hely = dto.Hely
            };
            _context.Versenyek.Add(verseny);
            await _context.SaveChangesAsync();
            return Ok(new { versenyId = verseny.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VersenyDto dto)
        {
            var verseny = await _context.Versenyek.FindAsync(id);
            if (verseny == null) return NotFound();

            verseny.Nev = dto.Nev;
            verseny.Datum = DateTime.SpecifyKind(dto.Datum, DateTimeKind.Utc);
            verseny.Hely = dto.Hely;

            await _context.SaveChangesAsync();
            return Ok("Verseny módosítva.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var verseny = await _context.Versenyek.FindAsync(id);
            if (verseny == null) return NotFound();

            _context.Versenyek.Remove(verseny);
            await _context.SaveChangesAsync();
            return Ok("Verseny törölve.");
        }
    }


}
