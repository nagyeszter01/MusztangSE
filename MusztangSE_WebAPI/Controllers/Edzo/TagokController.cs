using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Tag;
using MusztangSE.Library.MODEL;


namespace MusztangSE_WebAPI.Controllers.Edzo
{
  [ApiController]
[Route("api/coach/tagok")]
[Authorize(Roles = "edzo,admin")]
public class TagokController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TagokController(ApplicationDbContext context)
    {
        _context = context;
    }

    // CREATE
    [HttpPost]
    public async Task<IActionResult> AddTag([FromBody] TagCreateTeljesDto dto)
    {
        // Ellenőrzés: egyedi-e az azonosító
        var letezik = await _context.Felhasznalo
            .AnyAsync(f => f.FelhasznaloAzonosito == dto.FelhasznaloAzonosito);
        if (letezik)
            return BadRequest("Ez az azonosító már foglalt, generálj újat!");

        // Tag létrehozása
        var tag = new Tagok
        {
            Nev = dto.Nev,
            Szuletes = dto.Szuletes,
            AnyjaNeve = dto.AnyjaNeve,
            Lakcim = dto.Lakcim,
            Telefonszam = dto.Telefonszam,
            Email = dto.Email
        };
        _context.Tagok.Add(tag);
        await _context.SaveChangesAsync();

        // Sportolói adatok létrehozása
        var sportoloi = new SportoloiAdatok
        {
            TagId = tag.Id,
            TagsagiStatusz = dto.TagsagiStatusz,
            VersenyengedelySzam = dto.VersenyengedelySzam,
            TagsagKezdete = dto.TagsagKezdete,
            SportorvosiEngedely = dto.SportorvosiEngedely
        };
        _context.SportoloiAdatok.Add(sportoloi);

        // Felhasználó létrehozása
        var felhasznalo = new Felhasznalo
        {
            FelhasznaloAzonosito = dto.FelhasznaloAzonosito,
            TagId = tag.Id,
            SzerepkorId = 3,
            Aktiv = true
        };
        _context.Felhasznalo.Add(felhasznalo);

        await _context.SaveChangesAsync();

        return Ok(new { tagId = tag.Id });
    }

    // READ
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tagok = await _context.TagokView.ToListAsync();
        return Ok(tagok);
    }

    // UPDATE
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTag(int id, [FromBody] TagUpdateEdzoDto dto)
    {
        var tag = await _context.Tagok
            .Include(t => t.SportoloiAdatok)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tag == null)
            return NotFound();

        // Tagok tábla
        tag.Nev = dto.Nev;
        tag.Lakcim = dto.Lakcim;
        tag.Telefonszam = dto.Telefonszam;
        tag.Email = dto.Email;

        // Sportolói adatok
        if (tag.SportoloiAdatok == null)
        {
            tag.SportoloiAdatok = new SportoloiAdatok
            {
                TagId = tag.Id
            };
        }

        tag.SportoloiAdatok.TagsagiStatusz = dto.TagsagiStatusz;
        tag.SportoloiAdatok.VersenyengedelySzam = dto.VersenyengedelySzam;
        tag.SportoloiAdatok.TagsagKezdete = dto.TagsagKezdete;
        tag.SportoloiAdatok.SportorvosiEngedely = dto.SportorvosiEngedely;

        // Felhasználói azonosító hozzárendelése ha nincs még
        if (!string.IsNullOrEmpty(dto.FelhasznaloAzonosito))
        {
            var felhasznalo = await _context.Felhasznalo
                .FirstOrDefaultAsync(f => f.TagId == id);

            if (felhasznalo == null)
            {
                var letezik = await _context.Felhasznalo
                    .AnyAsync(f => f.FelhasznaloAzonosito == dto.FelhasznaloAzonosito);

                if (letezik)
                    return BadRequest("Ez az azonosító már foglalt, generálj újat!");

                _context.Felhasznalo.Add(new Felhasznalo
                {
                    FelhasznaloAzonosito = dto.FelhasznaloAzonosito,
                    TagId = id,
                    SzerepkorId = 3,
                    Aktiv = true
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok("Tag sikeresen módosítva.");
    }

    // DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        var tag = await _context.Tagok.FindAsync(id);
        if (tag == null)
            return NotFound();

        _context.Tagok.Remove(tag);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    }
}
