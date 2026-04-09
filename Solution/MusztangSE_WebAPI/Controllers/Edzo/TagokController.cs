using System.Security.Claims;
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
    public async Task<IActionResult> GetTagok()
    {
        var edzoIdStr = User.FindFirstValue("edzoId");
        if (string.IsNullOrEmpty(edzoIdStr) || !int.TryParse(edzoIdStr, out int edzoId))
            return Unauthorized();

        var edzo = await _context.Edzo.FindAsync(edzoId);
        if (edzo == null) return Unauthorized();

        if (edzo.MindenTagotLat)
        {
            var osszes = await _context.TagokView.ToListAsync();
            return Ok(osszes);
        }

        var sajatTagok = await _context.TagCsapat
            .Include(tc => tc.Tag)
            .ThenInclude(t => t.SportoloiAdatok)
            .Include(tc => tc.Tag)
            .ThenInclude(t => t.Felhasznalo)
            .Include(tc => tc.Csapat)
            .Where(tc => tc.Csapat.EdzoId == edzoId)
            .Select(tc => new
            {
                tagId = tc.Tag.Id,
                nev = tc.Tag.Nev,
                szuletes = tc.Tag.Szuletes,
                anyjaNeve = tc.Tag.AnyjaNeve,
                lakcim = tc.Tag.Lakcim,
                telefonszam = tc.Tag.Telefonszam,
                email = tc.Tag.Email,
                tagsagiStatusz = tc.Tag.SportoloiAdatok != null ? tc.Tag.SportoloiAdatok.TagsagiStatusz : false,
                versenyengedelySzam = tc.Tag.SportoloiAdatok != null ? tc.Tag.SportoloiAdatok.VersenyengedelySzam : null,
                tagsagKezdete = tc.Tag.SportoloiAdatok != null ? tc.Tag.SportoloiAdatok.TagsagKezdete : null,
                sportorvosiEngedely = tc.Tag.SportoloiAdatok != null ? tc.Tag.SportoloiAdatok.SportorvosiEngedely : null,
                felhasznaloAzonosito = tc.Tag.Felhasznalo != null ? tc.Tag.Felhasznalo.FelhasznaloAzonosito : null
            })
            .Distinct()
            .ToListAsync();

        return Ok(sajatTagok);
    }
    [HttpGet("ellenorzes/elnok")]
    public async Task<IActionResult> ElnokE()
    {
        var edzoIdStr = User.FindFirstValue("edzoId");
        if (string.IsNullOrEmpty(edzoIdStr) || !int.TryParse(edzoIdStr, out int edzoId))
            return Unauthorized();

        var edzo = await _context.Edzo.FindAsync(edzoId);
        if (edzo == null) return Unauthorized();

        return Ok(new { mindenTagotLat = edzo.MindenTagotLat });
    }
// Külön endpoint a csapat dropdown-hoz (szűrt)
    [HttpGet("sajat")]
    public async Task<IActionResult> GetSajatTagok()
    {
        var edzoIdStr = User.FindFirstValue("edzoId");
        if (string.IsNullOrEmpty(edzoIdStr) || !int.TryParse(edzoIdStr, out int edzoId))
            return Unauthorized();

        var edzo = await _context.Edzo.FindAsync(edzoId);
        if (edzo == null) return Unauthorized();

        if (edzo.MindenTagotLat)
        {
            var osszes = await _context.TagokView.ToListAsync();
            return Ok(osszes);
        }

        var sajatTagok = await _context.TagCsapat
            .Include(tc => tc.Tag)
            .Include(tc => tc.Csapat)
            .Where(tc => tc.Csapat.EdzoId == edzoId)
            .Select(tc => tc.Tag)
            .Distinct()
            .ToListAsync();

        return Ok(sajatTagok);
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
