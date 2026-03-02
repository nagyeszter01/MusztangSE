namespace MusztangSE.Library.MODEL.ViewModel;

public class VwEredmeny
{
    public int EredmenyId { get; set; } 
    public int CsapatId { get; set; }
    public string CsapatNev { get; set; } = "";
    public int VersenyId { get; set; }
    public string VersenyNev { get; set; } = "";
    public DateTime Datum { get; set; }
    public string Hely { get; set; } = "";
    public int? Helyezes { get; set; }
}