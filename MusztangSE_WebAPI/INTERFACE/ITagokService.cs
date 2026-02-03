using MusztangSE.Library.MODEL;

namespace MusztangSE_WebAPI.INTERFACE
{
    public interface ITagokService
    {
        // Összes tag
        Task<IEnumerable<Tagok>> GetAllTagAsync();

        // Egy darab tag id szerint
        Task<Tagok> GetTagByIdAsync(int id);

        // tag hozzáadása
        Task<bool> CreateTagAsync(Tagok newTag);

        // tag Módosítása
        Task<bool> UpdateTagAsync(Tagok modifiedTag);

        // tag törlése
        Task<bool> DeleteTagAsync(int Id);
    }
}
