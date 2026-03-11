using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.DATA;
using MusztangSe.Library.DTOs.Verseny;

namespace MusztangSE_WebAPI.SERVICES
{
    public class VersenyService
    {
        private readonly ApplicationDbContext _datacontext;
        public VersenyService(ApplicationDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        public async Task<List<VersenyDto>> GetAllAsync()
        {
            return await _datacontext.Versenyek
                .Select(v => new VersenyDto
                {
                    Id = v.Id,
                    Nev = v.Nev ?? "",
                    Datum = v.Datum,
                    Hely = v.Hely ?? ""
                })
                .ToListAsync();
        }

        public async Task<List<VersenyDto>> GetUpcomingAsync()
        {
            var today = DateTime.UtcNow;
            return await _datacontext.Versenyek
                .Where(v => v.Datum >= today)
                .OrderBy(v => v.Datum)
                .Select(v => new VersenyDto
                {
                    Id = v.Id,
                    Nev = v.Nev ?? "",
                    Datum = v.Datum,
                    Hely = v.Hely ?? ""
                })
                .ToListAsync();
        }

        public async Task<Verseny> CreateAsync(VersenyCreateDto dto)
        {
            var v = new Verseny
            {
                Nev = dto.Nev,
                Datum = dto.Datum,
                Hely = dto.Hely
            };
            _datacontext.Versenyek.Add(v);
            await _datacontext.SaveChangesAsync();
            return v;
        }
    }
}
