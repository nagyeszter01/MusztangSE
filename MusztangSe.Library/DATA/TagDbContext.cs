using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.MODEL;

namespace MusztangSE.Library.DATA
{
    public class TagDbContext : DbContext
    {
        public DbSet<Tagok> Tagok { get; set; }
        public DbSet<SportoloiAdatok> SportoloiAdatok { get; set; }
        public DbSet<Edzo> Edzo { get; set; }
        public DbSet<Csapat> Csapat { get; set; }
        public DbSet<TagCsapat> TagCsapat { get; set; }
        public DbSet<Verseny> Verseny { get; set; }
        public DbSet<Eredmeny> Eredmeny { get; set; }

        public TagDbContext() { }
        public TagDbContext(DbContextOptions<TagDbContext> options) : base(options) { }
    }
}
