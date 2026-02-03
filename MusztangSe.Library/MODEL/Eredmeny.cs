using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusztangSE.Library.MODEL
{
    public class Eredmeny
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Verseny")]
        public int VersenyId { get; set; }

        [ForeignKey("Csapat")]
        public int CsapatId { get; set; }

        public int Helyezes { get; set; }
    }
}
