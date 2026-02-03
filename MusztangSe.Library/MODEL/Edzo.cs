using System.ComponentModel.DataAnnotations;

namespace MusztangSE.Library.MODEL
{
    public class Edzo
    {
        [Key]
        public int Id { get; set; }
        public string Nev { get; set; }
    }
}
