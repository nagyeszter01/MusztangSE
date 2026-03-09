using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.SERVICES.Auth;

public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(Felhasznalo user)
    {
        var nev = user.Edzo?.Nev ?? user.Tag?.Nev ?? user.FelhasznaloAzonosito;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FelhasznaloAzonosito),
            new Claim("fullName", nev),
            new Claim("role", user.Szerepkor.Nev),
            new Claim("edzoId", user.EdzoId?.ToString() ?? "")  
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"])
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}