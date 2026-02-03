using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusztangSE.Library.MODEL
{
    public class TagCsapat
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("Tag")]
        public int TagId { get; set; }
        [ForeignKey("Csapat")]
        public int CsapatId { get; set; }
    }
}
