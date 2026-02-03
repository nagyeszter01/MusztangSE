using System.ComponentModel.DataAnnotations;

namespace MusztangSE.Library.MODEL
{
    public class Tagok
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nev { get; set; }

        public DateTime Szuletes { get; set; }

        public string AnyjaNeve { get; set; }

        public string Lakcim { get; set; }

        public string Telefonszam { get; set; }

        public string Email { get; set; }
    }
}
