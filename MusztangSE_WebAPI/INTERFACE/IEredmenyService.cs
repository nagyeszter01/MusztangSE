using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.INTERFACE
{
    public interface IEredmenyService
    {
        Task<IEnumerable<Eredmeny>> GetAllEredmenyAsync();
        Task<Eredmeny> GetEredmenyByIdAsync(int id);
        Task<bool> CreateEredmenyAsync(Eredmeny newEredmeny);
        Task<bool> UpdateEredmenyAsync(Eredmeny modifiedEredmeny);
        Task<bool> DeleteEredmenyAsync(int Id);
    }
}
