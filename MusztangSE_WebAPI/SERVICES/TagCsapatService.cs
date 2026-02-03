using Microsoft.EntityFrameworkCore;
using MusztangSE_WebAPI.INTERFACE;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.DATA;

namespace MusztangSE_WebAPI.SERVICES
{
    public class TagCsapatService : ITagCsapatService
    {
        private readonly TagDbContext _datacontext;

        public TagCsapatService(TagDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        public async Task<bool> CreateTagCsapatAsync(TagCsapat newTagCsapat)
        {
            await _datacontext.TagCsapat.AddAsync(newTagCsapat);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteTagCsapatAsync(int id)
        {
            var entity = await _datacontext.TagCsapat.FindAsync(id);
            _datacontext.TagCsapat.Remove(entity);
            return await _datacontext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<TagCsapat>> GetAllTagCsapatAsync()
        {
            return await _datacontext.TagCsapat.AsNoTracking().ToListAsync();
        }

        public async Task<TagCsapat> GetTagCsapatByIdAsync(int id)
        {
            return await _datacontext.TagCsapat.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> UpdateTagCsapatAsync(TagCsapat modifiedTagCsapat)
        {
            _datacontext.TagCsapat.Update(modifiedTagCsapat);
            return await _datacontext.SaveChangesAsync() > 0;
        }
    }
}
