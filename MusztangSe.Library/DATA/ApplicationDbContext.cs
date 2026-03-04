using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.MODEL.ViewModel;

namespace MusztangSE.Library.DATA
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Tagok> Tagok { get; set; }
        public DbSet<SportoloiAdatok> SportoloiAdatok { get; set; }
        public DbSet<Edzo> Edzo { get; set; }
        public DbSet<Csapat> Csapat { get; set; }
        public DbSet<TagCsapat> TagCsapat { get; set; }
        public DbSet<Verseny> Verseny { get; set; }
        public DbSet<Eredmeny> Eredmeny { get; set; }
        public DbSet<Szerepkor> Szerepkor { get; set; }
        public DbSet<Felhasznalo> Felhasznalo { get; set; }

        public ApplicationDbContext() { }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        
        // VIEW-K
        public DbSet<VwEredmeny> EredmenyekView { get; set; }

    }
}
