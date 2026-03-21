using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Edzo;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers.Edzo
{
    [Route("api/coach/csapatok")]
    [ApiController]
    [Authorize(Roles = "edzo,admin")]
    public class CsapatController : ControllerBase
    {
        
    private readonly ApplicationDbContext _context;

    public CsapatController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Összes csapat
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var csapatok = await _context.Csapat
            .Select(c => new { c.Id, c.Nev, c.Kategoria, c.Paros })
            .ToListAsync();
        return Ok(csapatok);
    }

    // Edző saját csapatai a tagokkal
    [HttpGet("sajat")]
    public async Task<IActionResult> GetSajat()
    {
        try
        {
            var edzoIdStr = User.FindFirstValue("edzoId");
            if (string.IsNullOrEmpty(edzoIdStr) || !int.TryParse(edzoIdStr, out int edzoId))
                return Unauthorized();

            var csapatok = await _context.Csapat
                .Include(c => c.TagCsapatok)
                .ThenInclude(tc => tc.Tag)
                .Where(c => c.EdzoId == edzoId)
                .ToListAsync();

            var eredmeny = csapatok.Select(c => new
            {
                c.Id,
                Nev = c.Nev ?? "",
                Kategoria = c.Kategoria ?? "",
                c.Paros,
                c.Archivalt,
                Tagok = (c.TagCsapatok ?? new List<TagCsapat>())
                    .Where(tc => tc != null && tc.Tag != null)
                    .Select(tc => new
                    {
                        tc.Tag.Id,
                        Nev = tc.Tag.Nev ?? ""
                    }).ToList()
            }).ToList();

            return Ok(eredmeny);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { hiba = ex.Message, belso = ex.InnerException?.Message });
        }
    }
    [HttpPatch("{id}/archival")]
    public async Task<IActionResult> Archival(int id)
    {
        var edzoIdStr = User.FindFirstValue("edzoId");
        if (string.IsNullOrEmpty(edzoIdStr) || !int.TryParse(edzoIdStr, out int edzoId))
            return Unauthorized();

        var csapat = await _context.Csapat.FindAsync(id);
        if (csapat == null) return NotFound();

        if (csapat.EdzoId != edzoId)
            return Forbid();

        csapat.Archivalt = !csapat.Archivalt;
        await _context.SaveChangesAsync();
        return Ok(new { archivalt = csapat.Archivalt });
    }

    // Tag hozzáadása csapathoz
    [HttpPost("tag-hozzaadas")]
    public async Task<IActionResult> TagHozzaadas([FromBody] TagCsapatDto dto)
    {
        var letezik = await _context.TagCsapat
            .AnyAsync(tc => tc.TagId == dto.TagId && tc.CsapatId == dto.CsapatId);

        if (letezik)
            return BadRequest("A tag már tagja ennek a csapatnak.");

        _context.TagCsapat.Add(new TagCsapat
        {
            TagId = dto.TagId,
            CsapatId = dto.CsapatId
        });

        await _context.SaveChangesAsync();
        return Ok("Tag sikeresen hozzáadva.");
    }

    // Tag eltávolítása csapatból
    [HttpDelete("tag-eltavolitas/{csapatId}/{tagId}")]
    public async Task<IActionResult> TagEltavolitas(int csapatId, int tagId)
    {
        var tagCsapat = await _context.TagCsapat
            .FirstOrDefaultAsync(tc => tc.CsapatId == csapatId && tc.TagId == tagId);

        if (tagCsapat == null)
            return NotFound();

        _context.TagCsapat.Remove(tagCsapat);
        await _context.SaveChangesAsync();
        return Ok("Tag sikeresen eltávolítva.");
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCsapat(int id)
    {
        var csapat = await _context.Csapat.FindAsync(id);
        if (csapat == null)
            return NotFound();

        _context.Csapat.Remove(csapat);
        await _context.SaveChangesAsync();
        return Ok("Csapat sikeresen törölve.");
    }

    [HttpPost]
    public async Task<IActionResult> CreateCsapat([FromBody] CsapatCreateDto dto)
    {
        var edzoIdStr = User.FindFirstValue("edzoId");
        if (string.IsNullOrEmpty(edzoIdStr) || !int.TryParse(edzoIdStr, out int edzoId))
            return Unauthorized();

        var csapat = new Csapat
        {
            Nev = dto.Nev,
            Kategoria = dto.Kategoria,
            Paros = dto.Paros,
            EdzoId = edzoId
        };

        _context.Csapat.Add(csapat);
        await _context.SaveChangesAsync();
        return Ok("Csapat sikeresen létrehozva.");
    }
    }
}
