using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusztangSE.Library.MODEL
{
    public class Csapat
    {
        [Key]
        public int Id { get; set; }
        public string Nev { get; set; }
        public string Kategoria { get; set; }
        public bool Paros { get; set; }
        [ForeignKey("Edzo")]
        public int  EdzoId { get; set; } 
    }
}
