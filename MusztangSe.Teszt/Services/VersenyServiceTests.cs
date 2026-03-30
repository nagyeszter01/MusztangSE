using MusztangSE_WebAPI.SERVICES;
using MusztangSE.Library.MODEL;
using MusztangSe.Teszt.Helpers;

namespace MusztangSe.Teszt.Services;

public class VersenyServiceTests
{
    [Fact]
    public async Task GetUpcomingAsync_CsakJovobeliVersenyeketAdVissza()
    {
        var context = TestDbContextHelper.GetInMemoryContext();
        context.Versenyek.AddRange(
            new Verseny { Nev = "Jövőbeli verseny", Datum = DateTime.UtcNow.AddDays(10), Hely = "Budapest" },
            new Verseny { Nev = "Elmúlt verseny", Datum = DateTime.UtcNow.AddDays(-10), Hely = "Pécs" }
        );
        await context.SaveChangesAsync();

        var service = new VersenyService(context);
        var result = await service.GetUpcomingAsync();

        Assert.Single(result);
        Assert.Equal("Jövőbeli verseny", result[0].Nev);
    }

    [Fact]
    public async Task GetUpcomingAsync_DatumSzerintNovekvoenRendez()
    {
        var context = TestDbContextHelper.GetInMemoryContext();
        context.Versenyek.AddRange(
            new Verseny { Nev = "Második", Datum = DateTime.UtcNow.AddDays(20), Hely = "Pécs" },
            new Verseny { Nev = "Első", Datum = DateTime.UtcNow.AddDays(5), Hely = "Budapest" }
        );
        await context.SaveChangesAsync();

        var service = new VersenyService(context);
        var result = await service.GetUpcomingAsync();

        Assert.Equal("Első", result[0].Nev);
        Assert.Equal("Második", result[1].Nev);
    }

    [Fact]
    public async Task GetUpcomingAsync_UresListat_AdVissza_HaNincsKozelgoVerseny()
    {
        var context = TestDbContextHelper.GetInMemoryContext();
        context.Versenyek.Add(
            new Verseny { Nev = "Régi verseny", Datum = DateTime.UtcNow.AddDays(-30), Hely = "Győr" }
        );
        await context.SaveChangesAsync();

        var service = new VersenyService(context);
        var result = await service.GetUpcomingAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAllAsync_MindenVersenyeketAdVissza()
    {
        var context = TestDbContextHelper.GetInMemoryContext();
        context.Versenyek.AddRange(
            new Verseny { Nev = "Első", Datum = DateTime.UtcNow.AddDays(-10), Hely = "Budapest" },
            new Verseny { Nev = "Második", Datum = DateTime.UtcNow.AddDays(10), Hely = "Pécs" }
        );
        await context.SaveChangesAsync();

        var service = new VersenyService(context);
        var result = await service.GetAllAsync();

        Assert.Equal(2, result.Count);
    }
}