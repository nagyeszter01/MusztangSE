using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.DATA;

namespace MusztangSE_WebAPI.SERVICES
{
    public class EredmenyService : IEredmenyService
    {
        private readonly TagDbContext _datacontext;
        public EredmenyService(TagDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        public async Task<bool> CreateEredmenyAsync(Eredmeny newEredmeny)
        {
            await _datacontext.Eredmeny.AddAsync(newEredmeny);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteEredmenyAsync(int Id)
        {
            var entity = await _datacontext.Eredmeny.FindAsync(Id);
            if (entity == null) return false;
            _datacontext.Eredmeny.Remove(entity);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Eredmeny>> GetAllEredmenyAsync()
        {
            return await _datacontext.Eredmeny.AsNoTracking().ToListAsync();
        }

        public async Task<Eredmeny> GetEredmenyByIdAsync(int id)
        {
            return await _datacontext.Eredmeny.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> UpdateEredmenyAsync(Eredmeny modifiedEredmeny)
        {
            _datacontext.Eredmeny.Update(modifiedEredmeny);
            return await _datacontext.SaveChangesAsync() > 0;
        }
    }
}
