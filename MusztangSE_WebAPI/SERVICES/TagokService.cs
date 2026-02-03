using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.DATA;
using MusztangSE.Library.MODEL;
using MusztangSE_WebAPI.INTERFACE;

namespace MusztangSE_WebAPI.SERVICES
{
    public class TagokService : ITagokService
    {
        private readonly TagDbContext _datacontext;
        public TagokService(TagDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        public async Task<bool> CreateTagAsync(Tagok newTag)
        {
            await _datacontext.Tagok.AddAsync(newTag);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteTagAsync(int Id)
        {
            var entity = await _datacontext.Tagok.FindAsync(Id);
            _datacontext.Tagok.Remove(entity);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Tagok>> GetAllTagAsync()
        {
            return await _datacontext.Tagok.AsNoTracking().ToListAsync();
        }

        public async Task<Tagok> GetTagByIdAsync(int id)
        {
            return await _datacontext.Tagok.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> UpdateTagAsync(Tagok modifiedTag)
        {
            _datacontext.Tagok.Update(modifiedTag);
            return await _datacontext.SaveChangesAsync() > 0;
        }
    }
}
