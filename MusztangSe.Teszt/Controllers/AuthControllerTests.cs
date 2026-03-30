using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MusztangSE_WebAPI.Controllers.Auth;
using MusztangSE_WebAPI.SERVICES.Auth;
using MusztangSe.Library.DTOs.Auth;
using MusztangSE.Library.MODEL;
using MusztangSe.Teszt.Helpers;

namespace MusztangSe.Teszt.Controllers;

public class AuthControllerTests
{
        private AuthController GetController()
    {
        var context = TestDbContextHelper.GetInMemoryContext();

        var szerepkor = new Szerepkor { Id = 1, Nev = "tag" };
        context.Szerepkor.Add(szerepkor);

        var felhasznalo = new Felhasznalo
        {
            FelhasznaloAzonosito = "TESZT123",
            JelszoHash = PasswordService.Hash("Teszt1234!"),
            Aktiv = true,
            SzerepkorId = 1,
            Szerepkor = szerepkor
        };
        context.Felhasznalo.Add(felhasznalo);
        context.SaveChanges();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string>
            {
                { "Jwt:Key", "EzEgyTitkosKulcsMin50KarakterRelativHosszu!!!!" }
            })
            .Build();

        var jwtService = new JwtService(config);
        return new AuthController(context, jwtService);
    }

    [Fact]
    public async Task Login_HelytesAdatokkal_OkEredmenyt_AdVissza()
    {
        var controller = GetController();
        var dto = new LoginDto
        {
            FelhasznaloAzonosito = "TESZT123",
            Password = "Teszt1234!",
            Szerep = "tag"
        };

        var result = await controller.Login(dto);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Login_RosszJelszoVal_UnauthorizedEredmenyt_AdVissza()
    {
        var controller = GetController();
        var dto = new LoginDto
        {
            FelhasznaloAzonosito = "TESZT123",
            Password = "RosszJelszo!",
            Szerep = "tag"
        };

        var result = await controller.Login(dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_NemLetezoFelhasznaloval_UnauthorizedEredmenyt_AdVissza()
    {
        var controller = GetController();
        var dto = new LoginDto
        {
            FelhasznaloAzonosito = "NEMLETEZIK",
            Password = "Teszt1234!",
            Szerep = "tag"
        };

        var result = await controller.Login(dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}