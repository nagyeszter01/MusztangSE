namespace MusztangSE.Library.MODEL.ViewModel;

public class VwTagTeljes
{
    public int TagId { get; set; }

    // Felhasználó
    public string FelhasznaloAzonosito { get; set; } = "";

    // Személyes adatok
    public string Nev { get; set; } = "";
    public DateTime Szuletes { get; set; }
    public string AnyjaNeve { get; set; } = "";
    public string Lakcim { get; set; } = "";
    public string Telefonszam { get; set; } = "";
    public string Email { get; set; } = "";

    // Sportolói adatok
    public bool? TagsagiStatusz { get; set; }
    public string VersenyengedelySzam { get; set; } = "";
    public DateTime? TagsagKezdete { get; set; }
    public DateTime? SportorvosiEngedely { get; set; }
}