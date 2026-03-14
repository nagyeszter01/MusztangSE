using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Admin;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers.Admin
{
 [ApiController]
[Route("api/admin/csapatok")]
[Authorize(Roles = "admin")]
public class AdminCsapatokController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminCsapatokController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var csapatok = await _context.Csapat
            .Include(c => c.Edzo)
            .Include(c => c.TagCsapatok)
                .ThenInclude(tc => tc.Tag)
            .Select(c => new
            {
                c.Id,
                c.Nev,
                c.Kategoria,
                c.Paros,
                Edzo = c.Edzo != null ? new { c.Edzo.Id, c.Edzo.Nev } : null,
                Tagok = c.TagCsapatok.Select(tc => new
                {
                    tc.Tag.Id,
                    tc.Tag.Nev
                }).ToList()
            })
            .ToListAsync();

        return Ok(csapatok);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AdminCsapatCreateDto dto)
    {
        var csapat = new Csapat
        {
            Nev = dto.Nev,
            Kategoria = dto.Kategoria,
            Paros = dto.Paros,
            EdzoId = dto.EdzoId
        };

        _context.Csapat.Add(csapat);
        await _context.SaveChangesAsync();
        return Ok(new { csapatId = csapat.Id });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var csapat = await _context.Csapat.FindAsync(id);
        if (csapat == null) return NotFound();

        _context.Csapat.Remove(csapat);
        await _context.SaveChangesAsync();
        return Ok("Csapat törölve.");
    }

    [HttpPatch("{id}/edzo")]
    public async Task<IActionResult> UpdateEdzo(int id, [FromBody] CsapatEdzoUpdateDto dto)
    {
        var csapat = await _context.Csapat.FindAsync(id);
        if (csapat == null) return NotFound();

        csapat.EdzoId = dto.EdzoId;
        await _context.SaveChangesAsync();
        return Ok("Csapat edzője módosítva.");
    }

    [HttpPost("tag-hozzaadas")]
    public async Task<IActionResult> TagHozzaadas([FromBody] AdminTagCsapatDto dto)
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
        return Ok("Tag hozzáadva.");
    }

    [HttpDelete("tag-eltavolitas/{csapatId}/{tagId}")]
    public async Task<IActionResult> TagEltavolitas(int csapatId, int tagId)
    {
        var tagCsapat = await _context.TagCsapat
            .FirstOrDefaultAsync(tc => tc.CsapatId == csapatId && tc.TagId == tagId);
        if (tagCsapat == null) return NotFound();

        _context.TagCsapat.Remove(tagCsapat);
        await _context.SaveChangesAsync();
        return Ok("Tag eltávolítva.");
    }

}
}
