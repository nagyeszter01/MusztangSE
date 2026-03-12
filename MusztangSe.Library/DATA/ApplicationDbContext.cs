using Microsoft.EntityFrameworkCore;
using MusztangSE.Library.MODEL;
using MusztangSE.Library.MODEL.ViewModel;

namespace MusztangSE.Library.DATA
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Tagok> Tagok { get; set; }
        public DbSet<SportoloiAdatok> SportoloiAdatok { get; set; }
        public DbSet<Edzo> Edzo { get; set; }
        public DbSet<Csapat> Csapat { get; set; }
        public DbSet<TagCsapat> TagCsapat { get; set; }
        public DbSet<Verseny> Versenyek { get; set; }
        public DbSet<Eredmeny> Eredmenyek { get; set; }
        public DbSet<Szerepkor> Szerepkor { get; set; }
        public DbSet<Felhasznalo> Felhasznalo { get; set; }
        
        // VIEW-K
        public DbSet<VwTagTeljes> TagokView { get; set; }

        public DbSet<VwEredmeny> EredmenyekView { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // VIEW konfiguráció
            modelBuilder.Entity<VwEredmeny>().HasNoKey().ToView("vw_Eredmenyek");
            
            // Táblanevek explicit megadása
            modelBuilder.Entity<Verseny>().ToTable("Verseny");
            modelBuilder.Entity<Eredmeny>().ToTable("Eredmeny");
            modelBuilder.Entity<Tagok>().ToTable("Tagok");
            modelBuilder.Entity<Szerepkor>().ToTable("Szerepkor");
            modelBuilder.Entity<Edzo>().ToTable("Edzo");
            modelBuilder.Entity<Csapat>().ToTable("Csapat");
            modelBuilder.Entity<TagCsapat>().ToTable("TagCsapat");
            modelBuilder.Entity<SportoloiAdatok>().ToTable("SportoloiAdatok");
            
            // Felhasználó konfiguráció
            modelBuilder.Entity<Felhasznalo>(entity =>
            {
                entity.ToTable("Felhasznalo");
                entity.HasKey(f => f.Id);

                entity.Property(f => f.FelhasznaloAzonosito).HasMaxLength(50).IsRequired();
                entity.Property(f => f.JelszoHash).HasMaxLength(255);
                entity.Property(f => f.Aktiv).HasDefaultValue(true);

                // Szerepkör FK
                entity.HasOne(f => f.Szerepkor)
                    .WithMany(r => r.Felhasznalok)
                    .HasForeignKey(f => f.SzerepkorId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Felhasznalo_Szerepkor");

                // Edző FK
                entity.HasOne(f => f.Edzo)
                    .WithMany(e => e.Felhasznalok)
                    .HasForeignKey(f => f.EdzoId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("FK_Felhasznalo_Edzo");

                // Tag FK
                entity.HasOne(f => f.Tag)
                    .WithOne(t => t.Felhasznalo)
                    .HasForeignKey<Felhasznalo>(f => f.TagId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("FK_Felhasznalo_Tag");
            });

            // Sportolói adatok
            modelBuilder.Entity<SportoloiAdatok>()
                .HasOne(s => s.Tag)
                .WithOne(t => t.SportoloiAdatok)
                .HasForeignKey<SportoloiAdatok>(s => s.TagId);

            // Tag-Csapat
            modelBuilder.Entity<TagCsapat>()
                .HasOne(tc => tc.Tag)
                .WithMany(t => t.TagCsapatok)
                .HasForeignKey(tc => tc.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TagCsapat>()
                .HasOne(tc => tc.Csapat)
                .WithMany(c => c.TagCsapatok)
                .HasForeignKey(tc => tc.CsapatId)
                .OnDelete(DeleteBehavior.Cascade);

            // Csapat - Edző
            modelBuilder.Entity<Csapat>()
                .HasOne(c => c.Edzo)
                .WithMany(e => e.Csapatok)
                .HasForeignKey(c => c.EdzoId)
                .OnDelete(DeleteBehavior.SetNull);
            // Eredmény - Csapat
            modelBuilder.Entity<Eredmeny>()
                .HasOne(e => e.Csapat)
                .WithMany(c => c.Eredmenyek)
                .HasForeignKey(e => e.CsapatId)
                .OnDelete(DeleteBehavior.Restrict);
            // Eredmény - Verseny
            modelBuilder.Entity<Eredmeny>()
                .HasOne(e => e.Verseny)
                .WithMany(v => v.Eredmenyek)
                .HasForeignKey(e => e.VersenyId)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
