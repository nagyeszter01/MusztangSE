using System.ComponentModel.DataAnnotations;

namespace MusztangSE.Library.MODEL
{
    public class Edzo
    {
        [Key]
        public int Id { get; set; }
        public string Nev { get; set; }
        public ICollection<Felhasznalo> Felhasznalok { get; set; } = new List<Felhasznalo>();
        public ICollection<Csapat> Csapatok { get; set; } = new List<Csapat>();
    }
}
