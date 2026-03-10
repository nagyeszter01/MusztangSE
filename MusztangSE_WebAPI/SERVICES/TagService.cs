using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSE.Library.MODEL;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL.ViewModel;

namespace MusztangSE_WebAPI.SERVICES
{
    public class TagService
    {
        private readonly ApplicationDbContext _datacontext;
        public TagService(ApplicationDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        // 🔹 Edző / Admin: összes tag
        public async Task<List<VwTagTeljes>> GetAllAsync()
        {
            return await _datacontext.TagokView
                .OrderBy(t => t.Nev)
                .ToListAsync();
        }

        // 🔹 Tag: saját adatok (JWT-ből)
        public async Task<VwTagTeljes?> GetByFelhasznaloAzonositoAsync(string azonosito)
        {
            return await _datacontext.TagokView
                .FirstOrDefaultAsync(t => t.FelhasznaloAzonosito == azonosito);
        }

        // 🔹 Edző: egy tag ID alapján
        public async Task<VwTagTeljes?> GetByTagIdAsync(int tagId)
        {
            return await _datacontext.TagokView
                .FirstOrDefaultAsync(t => t.TagId == tagId);
        }
    }
}
