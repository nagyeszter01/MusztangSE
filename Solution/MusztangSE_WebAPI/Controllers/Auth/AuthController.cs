using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.SERVICES.Auth;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Auth;

namespace MusztangSE_WebAPI.Controllers.Auth
{
    [Route("api/auth")]    [ApiController]
    public class AuthController : ControllerBase
    {
         private readonly ApplicationDbContext _context;
        private readonly JwtService _jwt;

        public AuthController(ApplicationDbContext context, JwtService jwt)
        {
            _context = context;
            _jwt = jwt;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _context.Felhasznalo
                .Include(u => u.Szerepkor)
                .Include(u => u.Edzo)
                .Include(u => u.Tag)
                .FirstOrDefaultAsync(u => u.FelhasznaloAzonosito == dto.FelhasznaloAzonosito);
            if (user == null || user.JelszoHash == null || !PasswordService.Verify(dto.Password, user.JelszoHash))
                return Unauthorized("Hibás azonosító vagy jelszó.");

            // Szerep ellenőrzés
            var valasztottSzerep = dto.Szerep.ToLower();
            var valodiSzerep = user.Szerepkor.Nev.ToLower();

            bool egyezik = (valasztottSzerep == "edzo" && valodiSzerep == "edzo") ||
                           (valasztottSzerep == "edzo" && valodiSzerep == "admin") || 
                           (valasztottSzerep == "sportolo" && valodiSzerep == "tag") ||
                           (valasztottSzerep == "tag" && valodiSzerep == "tag");

            if (!egyezik)
                return Unauthorized("A kiválasztott szerep nem egyezik a fiókod típusával.");

            var token = _jwt.GenerateToken(user);
            return Ok(token);
        }

        [HttpPost("setpassword")]
        public async Task<IActionResult> SetPassword(SetPasswordDto dto)
        {
            if (dto.Password != dto.ConfirmPassword)
                return BadRequest("A jelszavak nem egyeznek.");

            var user = await _context.Felhasznalo
                .FirstOrDefaultAsync(u => u.FelhasznaloAzonosito == dto.FelhasznaloAzonosito);

            if (user == null)
                return NotFound("Felhasználó nem található.");

            user.JelszoHash = PasswordService.Hash(dto.Password);
            user.PasswordSetAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Jelszó sikeresen beállítva.");
        }
    
    }
}
