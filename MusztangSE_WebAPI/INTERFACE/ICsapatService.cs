using MusztangSE.Library.MODEL;


namespace MusztangSE_WebAPI.INTERFACE
{
    public interface ICsapatService
    {
        Task<IEnumerable<Csapat>> GetAllCsapatAsync();
        Task<Csapat> GetCsapatByIdAsync(int id);
        Task<bool> CreateCsapatAsync(Csapat newCsapat);
        Task<bool> UpdateCsapatAsync(Csapat modifiedCsapat);
        Task<bool> DeleteCsapatAsync(int id);
    }
}
