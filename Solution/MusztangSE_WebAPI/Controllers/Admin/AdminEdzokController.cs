using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Admin;

namespace MusztangSE_WebAPI.Controllers.Admin
{
   
[ApiController]
[Route("api/admin/edzok")]
[Authorize(Roles = "admin")]
public class AdminEdzokController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminEdzokController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Összes edző csapataikkal
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var edzok = await _context.Edzo
            .Include(e => e.Csapatok)
            .Include(e => e.Felhasznalok)
            .Select(e => new
            {
                e.Id,
                e.Nev,
                e.MindenTagotLat,
                FelhasznaloAzonosito = e.Felhasznalok.Select(f => f.FelhasznaloAzonosito).FirstOrDefault(),
                Csapatok = e.Csapatok.Select(c => new
                {
                    c.Id,
                    c.Nev,
                    c.Kategoria,
                    c.Paros
                }).ToList()
            })
            .ToListAsync();

        return Ok(edzok);
    }

    // Edző törlése — csapatok átrendelése másik edzőhöz
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] int? ujEdzoId)
    {
        var edzo = await _context.Edzo
            .Include(e => e.Csapatok)
            .Include(e => e.Felhasznalok)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (edzo == null)
            return NotFound();

        // Csapatok átrendelése ha van új edző
        if (edzo.Csapatok.Any())
        {
            if (ujEdzoId == null)
                return BadRequest("Az edzőnek vannak csapatai. Add meg az új edző ID-ját!");

            var ujEdzo = await _context.Edzo.FindAsync(ujEdzoId);
            if (ujEdzo == null)
                return BadRequest("Az új edző nem található.");

            foreach (var csapat in edzo.Csapatok)
            {
                csapat.EdzoId = ujEdzoId;
            }
        }

        // Felhasználó törlése
        foreach (var f in edzo.Felhasznalok)
        {
            _context.Felhasznalo.Remove(f);
        }

        _context.Edzo.Remove(edzo);
        await _context.SaveChangesAsync();
        return Ok("Edző sikeresen törölve.");
    }

    // Edző nevének módosítása
    [HttpPatch("{id}/nev")]
    public async Task<IActionResult> UpdateNev(int id, [FromBody] EdzoNevUpdateDto dto)
    {
        var edzo = await _context.Edzo.FindAsync(id);
        if (edzo == null)
            return NotFound();

        edzo.Nev = dto.Nev;
        await _context.SaveChangesAsync();
        return Ok("Edző neve módosítva.");
    }
    [HttpPatch("{id}/minden-tagot-lat")]
    public async Task<IActionResult> ToggleMindenTagotLat(int id)
    {
        var edzo = await _context.Edzo.FindAsync(id);
        if (edzo == null) return NotFound();

        edzo.MindenTagotLat = !edzo.MindenTagotLat;
        await _context.SaveChangesAsync();
        return Ok(new { mindenTagotLat = edzo.MindenTagotLat });
    }
}
}
