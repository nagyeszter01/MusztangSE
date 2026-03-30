using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Admin;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.Controllers.Admin
{
   
[ApiController]
[Route("api/admin/felhasznalok")]
[Authorize(Roles = "admin")]
public class AdminTagokController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminTagokController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var felhasznalok = await _context.Felhasznalo
            .Include(f => f.Szerepkor)
            .Include(f => f.Edzo)
            .Include(f => f.Tag)
            .Select(f => new
            {
                f.Id,
                f.FelhasznaloAzonosito,
                f.Aktiv,
                f.PasswordSetAt,
                Szerepkor = f.Szerepkor.Nev,
                Nev = f.Edzo != null ? f.Edzo.Nev : f.Tag != null ? f.Tag.Nev : f.FelhasznaloAzonosito
            })
            .ToListAsync();

        return Ok(felhasznalok);
    }

    [HttpPost("edzo")]
    public async Task<IActionResult> AddEdzo([FromBody] EdzoCreateDto dto)
    {
        var letezik = await _context.Felhasznalo
            .AnyAsync(f => f.FelhasznaloAzonosito == dto.FelhasznaloAzonosito);
        if (letezik)
            return BadRequest("Ez az azonosító már foglalt.");

        var ujEdzo = new MusztangSE.Library.MODEL.Edzo { Nev = dto.Nev };
        _context.Edzo.Add(ujEdzo);
        await _context.SaveChangesAsync();

        var szerepkorId = await _context.Szerepkor
            .Where(r => r.Nev == "edzo")
            .Select(r => r.Id)
            .FirstOrDefaultAsync();

        var felhasznalo = new Felhasznalo
        {
            FelhasznaloAzonosito = dto.FelhasznaloAzonosito,
            EdzoId = ujEdzo.Id,
            SzerepkorId = szerepkorId,
            Aktiv = true
        };

        _context.Felhasznalo.Add(felhasznalo);
        await _context.SaveChangesAsync();

        return Ok(new { edzoId = ujEdzo.Id, felhasznaloId = felhasznalo.Id });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var felhasznalo = await _context.Felhasznalo
            .Include(f => f.Szerepkor)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (felhasznalo == null)
            return NotFound();

        // Admin nem törölhet másik admint
        if (felhasznalo.Szerepkor?.Nev == "admin")
        {
            // Saját fiókját törölheti
            var sajtaIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(sajtaIdStr, out int sajatId) || felhasznalo.Id != sajatId)
                return BadRequest("Admin felhasználót nem lehet törölni.");
        }

        _context.Felhasznalo.Remove(felhasznalo);
        await _context.SaveChangesAsync();
        return Ok("Felhasználó törölve.");
    }

    [HttpPatch("{id}/aktiv")]
    public async Task<IActionResult> ToggleAktiv(int id)
    {
        var felhasznalo = await _context.Felhasznalo.FindAsync(id);
        if (felhasznalo == null)
            return NotFound();

        felhasznalo.Aktiv = !felhasznalo.Aktiv;
        await _context.SaveChangesAsync();
        return Ok(new { aktiv = felhasznalo.Aktiv });
    }

    [HttpPatch("{id}/azonosito")]
    public async Task<IActionResult> UpdateAzonosito(int id, [FromBody] AzonositoUpdateDto dto)
    {
        var letezik = await _context.Felhasznalo
            .AnyAsync(f => f.FelhasznaloAzonosito == dto.FelhasznaloAzonosito && f.Id != id);
        if (letezik)
            return BadRequest("Ez az azonosító már foglalt.");

        var felhasznalo = await _context.Felhasznalo.FindAsync(id);
        if (felhasznalo == null)
            return NotFound();

        felhasznalo.FelhasznaloAzonosito = dto.FelhasznaloAzonosito;
        await _context.SaveChangesAsync();
        return Ok("Azonosító módosítva.");
    }
}
}
