using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.INTERFACE
{
    public interface ISportoloiAdatokService
    {
        Task<IEnumerable<SportoloiAdatok>> GetAllSportoloiAdatAsync();
        Task<SportoloiAdatok> GetSportoloiAdatByIdAsync(int id);
        Task<bool> CreateSportoloiAdatAsync(SportoloiAdatok newSportoloiAdat);
        Task<bool> UpdateSportoloiAdatAsync(SportoloiAdatok modifiedSportoloiAdat);
        Task<bool> DeleteSportoloiAdatAsync(int id);
    }
}
