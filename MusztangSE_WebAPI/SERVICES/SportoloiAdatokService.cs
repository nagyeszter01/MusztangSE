using Azure;
using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.DATA;

namespace MusztangSE_WebAPI.SERVICES
{
    public class SportoloiAdatokService : ISportoloiAdatokService
    {
        private readonly TagDbContext _datacontext;

        public SportoloiAdatokService(TagDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        public async Task<bool> CreateSportoloiAdatAsync(SportoloiAdatok newSportoloiAdat)
        {
            await _datacontext.SportoloiAdatok.AddAsync(newSportoloiAdat);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteSportoloiAdatAsync(int id)
        {
            var entity = await _datacontext.SportoloiAdatok.FindAsync(id);
            _datacontext.SportoloiAdatok.Remove(entity);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<SportoloiAdatok>> GetAllSportoloiAdatAsync()
        {
            return await _datacontext.SportoloiAdatok.AsNoTracking().ToListAsync();
        }

        public async Task<SportoloiAdatok> GetSportoloiAdatByIdAsync(int id)
        {
            return await _datacontext.SportoloiAdatok.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> UpdateSportoloiAdatAsync(SportoloiAdatok modifiedSportoloiAdat)
        {
            _datacontext.SportoloiAdatok.Update(modifiedSportoloiAdat);
            return await _datacontext.SaveChangesAsync() > 0;
        }
    }
}
