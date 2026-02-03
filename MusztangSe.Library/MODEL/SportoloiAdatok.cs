using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusztangSE.Library.MODEL
{
    public class SportoloiAdatok
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("Tag")]
        public int TagId { get; set; }
        public bool TagsagiStatusz { get; set; }
        public string VersenyengedelySzam { get; set; }
        public DateTime TagsagKezdete { get; set; }
        public DateTime SportorvosiEngedely { get; set; }
    }
}
