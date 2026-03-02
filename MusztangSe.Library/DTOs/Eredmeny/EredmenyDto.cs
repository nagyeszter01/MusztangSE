namespace MusztangSe.Library.DTOs.Eredmeny;

public class EredmenyDto
{
    public int Id { get; set; }
    public int VersenyId { get; set; }
    public int CsapatId { get; set; }
    public int? Helyezes { get; set; }
}