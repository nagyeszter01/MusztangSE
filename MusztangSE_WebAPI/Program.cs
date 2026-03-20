using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSE_WebAPI.SERVICES;
using MusztangSE_WebAPI.SERVICES.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MusztangSE_WebAPI.Middleware;


var builder = WebApplication.CreateBuilder(args);

//Database
builder.Services.AddDbContext<ApplicationDbContext>(opt => opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// --- Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = 
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// --- CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWeb", policy =>
    {
        policy.WithOrigins(
                "https://localhost:7089",
                "http://localhost:7089",
                "http://localhost:5089"
            )            
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// --- JWT Authentication
Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler.DefaultInboundClaimTypeMap.Clear();
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            RoleClaimType = "role"  
        };
    });

// --- Authorization
builder.Services.AddAuthorization();

// --- Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MusztangSE API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT token megadása: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
// --- Services (DI regisztráció)
builder.Services.AddScoped<EredmenyService>();
builder.Services.AddScoped<TagService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<VersenyService>(); 


var app = builder.Build();

// --- Middleware
app.UseMiddleware<ExceptionMiddleware>();

// --- Swagger UI
app.UseSwagger();
app.UseSwaggerUI();

// --- CORS (UseRouting előtt kell lennie!)
app.UseCors("AllowWeb");
// --- Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// --- Map controllers
app.MapControllers();

app.Run();
