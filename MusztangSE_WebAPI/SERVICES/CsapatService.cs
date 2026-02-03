using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.DATA;

namespace MusztangSE_WebAPI.SERVICES
{
    public class CsapatService : ICsapatService
    {
        private readonly TagDbContext _datacontext;

        public CsapatService(TagDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        public async Task<bool> CreateCsapatAsync(Csapat newCsapat)
        {
            await _datacontext.Csapat.AddAsync(newCsapat);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteCsapatAsync(int id)
        {
            var entity = await _datacontext.Csapat.FindAsync(id);
            _datacontext.Csapat.Remove(entity);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Csapat>> GetAllCsapatAsync()
        {
            return await _datacontext.Csapat.AsNoTracking().ToListAsync();
        }

        public async Task<Csapat> GetCsapatByIdAsync(int id)
        {
            return await _datacontext.Csapat.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> UpdateCsapatAsync(Csapat modifiedCsapat)
        {
            _datacontext.Csapat.Update(modifiedCsapat);
            return await _datacontext.SaveChangesAsync() > 0;
        }
    }
}
