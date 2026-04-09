using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using MusztangSE_WebAPI.SERVICES.Auth;
using MusztangSE.Library.MODEL;

namespace MusztangSe.Teszt.Services;

public class JwtServiceTests
{
    private JwtService GetJwtService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string>
            {
                { "Jwt:Key", "EzEgyTitkosKulcsMin50KarakterRelativHosszu!!!!" }
            })
            .Build();
        return new JwtService(config);
    }

    [Fact]
    public void GenerateToken_NemNull()
    {
        var service = GetJwtService();
        var felhasznalo = new Felhasznalo
        {
            Id = 1,
            FelhasznaloAzonosito = "TESZT123",
            Szerepkor = new Szerepkor { Nev = "edzo" }
        };

        var token = service.GenerateToken(felhasznalo);

        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public void GenerateToken_ErvenyesJwtFormatot_AllitElo()
    {
        var service = GetJwtService();
        var felhasznalo = new Felhasznalo
        {
            Id = 1,
            FelhasznaloAzonosito = "TESZT123",
            Szerepkor = new Szerepkor { Nev = "tag" }
        };

        var token = service.GenerateToken(felhasznalo);
        var handler = new JwtSecurityTokenHandler();

        Assert.True(handler.CanReadToken(token));
    }

    [Fact]
    public void GenerateToken_TartalmazzaARoleClaimet()
    {
        var service = GetJwtService();
        var felhasznalo = new Felhasznalo
        {
            Id = 1,
            FelhasznaloAzonosito = "TESZT123",
            Szerepkor = new Szerepkor { Nev = "admin" }
        };

        var token = service.GenerateToken(felhasznalo);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "role");
        Assert.NotNull(roleClaim);
        Assert.Equal("admin", roleClaim.Value);
    }
}