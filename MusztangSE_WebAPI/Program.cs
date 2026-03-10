using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE_WebAPI.SERVICES;
using MusztangSE_WebAPI.SERVICES.Auth;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(opt => opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<EredmenyService>();
builder.Services.AddScoped<TagService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<VersenyService>(); 

builder.Services.AddCors(options =>
{
    options.AddPolicy("Cors7089", policy =>
    {
        policy.WithOrigins("https://localhost:7089/")
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseCors("Cors7089");

app.Run();
