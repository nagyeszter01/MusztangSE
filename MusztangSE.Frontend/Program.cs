var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();




app.UseDefaultFiles(new DefaultFilesOptions
{

    DefaultFileNames = new List<string> { "/Tag/MainPageTagok.html"}
});

app.UseStaticFiles();
app.Run();
