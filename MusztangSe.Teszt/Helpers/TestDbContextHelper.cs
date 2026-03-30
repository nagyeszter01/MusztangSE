using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;

namespace MusztangSe.Teszt.Helpers;

public class TestDbContextHelper
{
    public static ApplicationDbContext GetInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }
}