using MusztangSE.Library.MODEL;
namespace MusztangSE_WebAPI.INTERFACE
{
    public interface ITagCsapatService
    {
        Task<IEnumerable<TagCsapat>> GetAllTagCsapatAsync();
        Task<TagCsapat> GetTagCsapatByIdAsync(int id);
        Task<bool> CreateTagCsapatAsync(TagCsapat newTagCsapat);
        Task<bool> UpdateTagCsapatAsync(TagCsapat modifiedTagCsapat);
        Task<bool> DeleteTagCsapatAsync(int id);
    }
}
