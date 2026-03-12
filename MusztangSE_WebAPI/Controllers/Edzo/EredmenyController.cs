using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Edzo;
using MusztangSE.Library.MODEL;


namespace MusztangSE_WebAPI.Controllers.Edzo
{

    [ApiController]
    [Route("api/coach/eredmenyek")]
    [Authorize(Roles = "edzo,admin")]
    public class EredmenyController : ControllerBase
    {
            private readonly ApplicationDbContext _context;

    public EredmenyController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var edzoIdStr = User.FindFirstValue("edzoId");
        if (string.IsNullOrEmpty(edzoIdStr) || !int.TryParse(edzoIdStr, out int edzoId))
            return Unauthorized();

        var eredmenyek = await _context.Eredmenyek
            .Include(e => e.Verseny)
            .Include(e => e.Csapat)
            .Where(e => e.Csapat.EdzoId == edzoId)
            .Select(e => new
            {
                e.Id,
                e.Helyezes,
                Verseny = new { e.Verseny.Id, e.Verseny.Nev, e.Verseny.Datum },
                Csapat = new { e.Csapat.Id, e.Csapat.Nev, e.Csapat.Kategoria }
            })
            .OrderByDescending(e => e.Verseny.Datum)
            .ToListAsync();

        return Ok(eredmenyek);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EredmenyCreateDto dto)
    {
        var edzoIdStr = User.FindFirstValue("edzoId");
        if (string.IsNullOrEmpty(edzoIdStr) || !int.TryParse(edzoIdStr, out int edzoId))
            return Unauthorized();

        var csapat = await _context.Csapat.FindAsync(dto.CsapatId);
        if (csapat == null || csapat.EdzoId != edzoId)
            return BadRequest("Csak a saját csapatodhoz adhatsz eredményt.");

        var eredmeny = new Eredmeny
        {
            VersenyId = dto.VersenyId,
            CsapatId = dto.CsapatId,
            Helyezes = dto.Helyezes
        };

        try
        {
            _context.Eredmenyek.Add(eredmeny);
            await _context.SaveChangesAsync();
            return Ok(new { eredmenyId = eredmeny.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                hiba = ex.Message, 
                belsoHiba = ex.InnerException?.Message 
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] EredmenyCreateDto dto)
    {
        var eredmeny = await _context.Eredmenyek.FindAsync(id);
        if (eredmeny == null) return NotFound();

        eredmeny.VersenyId = dto.VersenyId;
        eredmeny.CsapatId = dto.CsapatId;
        eredmeny.Helyezes = dto.Helyezes;

        await _context.SaveChangesAsync();
        return Ok("Eredmény módosítva.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var eredmeny = await _context.Eredmenyek.FindAsync(id);
        if (eredmeny == null) return NotFound();

        _context.Eredmenyek.Remove(eredmeny);
        await _context.SaveChangesAsync();
        return Ok("Eredmény törölve.");
    }

    }
}
