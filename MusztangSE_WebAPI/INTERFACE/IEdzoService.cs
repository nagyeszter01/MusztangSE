using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.INTERFACE
{
    public interface IEdzoService
    {
        Task<IEnumerable<Edzo>> GetAllEdzoAsync();
        Task<Edzo> GetEdzoByIdAsync(int id);
        Task<bool> CreateEdzoAsync(Edzo newEdzo);
        Task<bool> UpdateEdzoAsync(Edzo modifiedEdzo);
        Task<bool> DeleteEdzoAsync(int id);
    }
}
