using System.ComponentModel.DataAnnotations;

namespace MusztangSE.Library.MODEL
{
    public class Verseny
    {
        [Key]
        public int Id { get; set; }
        public string Nev { get; set; }
        public DateTime Datum { get; set; }
        public string Hely { get; set; }
    }
}
