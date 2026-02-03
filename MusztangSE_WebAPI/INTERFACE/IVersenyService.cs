using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.INTERFACE
{
    public interface IVersenyService
    {
        Task<IEnumerable<Verseny>> GetAllVersenyAsync();
        Task<Verseny> GetVersenyByIdAsync(int id);
        Task<bool> CreateVersenyAsync(Verseny newVerseny);
        Task<bool> UpdateVersenyAsync(Verseny modifiedVerseny);
        Task<bool> DeleteVersenyAsync(int id);
    }
}
