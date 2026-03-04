using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.DATA;

namespace MusztangSE_WebAPI.SERVICES
{
    public class EdzoService : IEdzoService
    {
        private readonly ApplicationDbContext _datacontext;

        public EdzoService(ApplicationDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        public async Task<bool> CreateEdzoAsync(Edzo newEdzo)
        {
            await _datacontext.Edzo.AddAsync(newEdzo);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteEdzoAsync(int id)
        {
            var entity = await _datacontext.Edzo.FindAsync(id);
            _datacontext.Edzo.Remove(entity);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Edzo>> GetAllEdzoAsync()
        {
            return await _datacontext.Edzo.AsNoTracking().ToListAsync();
        }

        public async Task<Edzo> GetEdzoByIdAsync(int id)
        {
            return await _datacontext.Edzo.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> UpdateEdzoAsync(Edzo modifiedEdzo)
        {
            _datacontext.Edzo.Update(modifiedEdzo);
            return await _datacontext.SaveChangesAsync() > 0;
        }
    }
}
