using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusztangSE.Library.MODEL
{
    public class Eredmeny
    {
        public int Id { get; set; }
        
        public int VersenyId { get; set; }
        public Verseny Verseny { get; set; }

        public int CsapatId { get; set; }
        public Csapat Csapat { get; set; }


        public int? Helyezes { get; set; }
    }
}
