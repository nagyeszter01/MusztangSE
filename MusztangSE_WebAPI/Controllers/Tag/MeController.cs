using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.SERVICES;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Tag;

namespace MusztangSE_WebAPI.Controllers.Tag
{

    [ApiController]
    [Route("api/tag/me")]
    [Authorize(Roles = "tag")]
    public class MeController : ControllerBase
    {
        private readonly TagService _tagService;
        private readonly ApplicationDbContext _context;

        public MeController(TagService tagService, ApplicationDbContext context)
        {
            _tagService = tagService;
            _context = context;
        }

        [HttpGet("adataim")]
        public async Task<IActionResult> GetMyData()
        {
            var azonosito = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(azonosito))
                return Unauthorized();

            var tag = await _tagService.GetByFelhasznaloAzonositoAsync(azonosito);

            if (tag == null)
                return NotFound();

            return Ok(tag);
        }

        [HttpPut("adataim")]
        public async Task<IActionResult> UpdateMyData([FromBody] TagUpdateDto dto)
        {
            var azonosito = User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(azonosito))
                return Unauthorized();

            var felhasznalo = await _context.Felhasznalo
                .FirstOrDefaultAsync(f => f.FelhasznaloAzonosito == azonosito);

            if (felhasznalo == null || felhasznalo.TagId == null)
                return NotFound();

            var tag = await _context.Tagok.FindAsync(felhasznalo.TagId);

            if (tag == null)
                return NotFound();

            if (dto.Lakcim != null) tag.Lakcim = dto.Lakcim;
            if (dto.Telefonszam != null) tag.Telefonszam = dto.Telefonszam;
            if (dto.Email != null) tag.Email = dto.Email;

            await _context.SaveChangesAsync();
            return Ok("Adatok sikeresen frissítve.");
        }
    }
}
