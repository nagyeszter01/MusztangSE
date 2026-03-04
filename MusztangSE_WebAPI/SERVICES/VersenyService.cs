using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.DATA;

namespace MusztangSE_WebAPI.SERVICES
{
    public class VersenyService : IVersenyService
    {
        private readonly ApplicationDbContext _datacontext;
        public VersenyService(ApplicationDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        public async Task<bool> CreateVersenyAsync(Verseny newVerseny)
        {
            await _datacontext.Verseny.AddAsync(newVerseny);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteVersenyAsync(int id)
        {
            var entity = await _datacontext.Verseny.FindAsync(id);
            _datacontext.Verseny.Remove(entity);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Verseny>> GetAllVersenyAsync()
        {
            return await _datacontext.Verseny.AsNoTracking().ToListAsync();
        }

        public async Task<Verseny> GetVersenyByIdAsync(int id)
        {
            return await _datacontext.Verseny.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> UpdateVersenyAsync(Verseny modifiedVerseny)
        {
            _datacontext.Verseny.Update(modifiedVerseny);
            return await _datacontext.SaveChangesAsync() > 0;
        }
    }
}
