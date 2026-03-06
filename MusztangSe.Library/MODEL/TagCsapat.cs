using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusztangSE.Library.MODEL
{
    public class TagCsapat
    {
        [Key]
        public int Id { get; set; }
        public int TagId { get; set; }
        public Tagok Tag { get; set; }
        public int CsapatId { get; set; }
        public Csapat Csapat { get; set; }

    }
}
