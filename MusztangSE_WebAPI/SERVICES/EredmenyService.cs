using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.DATA;
using MusztangSE.Library.MODEL.ViewModel;

namespace MusztangSE_WebAPI.SERVICES
{
    public class EredmenyService 
    {
        private readonly ApplicationDbContext _datacontext;
        public EredmenyService(ApplicationDbContext datacontext)
        {
            _datacontext = datacontext;
        }
        // Minden eredmény
        public async Task<List<VwEredmeny>> GetAllAsync()
        {
            return await _datacontext.EredmenyekView
                .OrderBy(e => e.Datum)
                .ToListAsync();
        }

        // Közelgő eredmények
        public async Task<List<VwEredmeny>> GetUpcomingAsync()
        {
            var today = DateTime.UtcNow;
            return await _datacontext.EredmenyekView
                .Where(e => e.Datum >= today)
                .OrderBy(e => e.Datum)
                .ToListAsync();
        }
    }
}
