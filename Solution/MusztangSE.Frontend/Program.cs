var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles();

// Gyökér URL átirányítása a főoldalra
app.MapGet("/", () => Results.Redirect("/Fooldal/fooldal.html"));

app.Run();