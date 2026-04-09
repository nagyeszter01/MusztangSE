using System.ComponentModel.DataAnnotations;

namespace MusztangSE.Library.MODEL
{
    public class Tagok
    {
        public int Id { get; set; }
        public string Nev { get; set; }

        public DateTime Szuletes { get; set; }

        public string AnyjaNeve { get; set; }

        public string Lakcim { get; set; }

        public string? Telefonszam { get; set; }

        public string? Email { get; set; }
        
        public Felhasznalo? Felhasznalo { get; set; }
        public SportoloiAdatok? SportoloiAdatok { get; set; }

        public ICollection<TagCsapat> TagCsapatok { get; set; }
    }
}
