namespace MusztangSe.Library.DTOs.SportoloiAdatok;

public class SportoloiAdatokDto
{
    public int TagId { get; set; }
    public bool TagsagiStatusz { get; set; }
    public string VersenyengedelySzam { get; set; }
    public DateTime? TagsagKezdete { get; set; }
    public DateTime? SportorvosiEngedely { get; set; }
}