namespace MusztangSe.Library.DTOs.Tag;

public class TagUpdateEdzoDto
{
    // Tagok tábla
    public string Nev { get; set; }
    public string Lakcim { get; set; }
    public string Telefonszam { get; set; }
    public string Email { get; set; }
    public string? FelhasznaloAzonosito { get; set; }

    // SportoloiAdatok tábla
    public bool TagsagiStatusz { get; set; }
    public string VersenyengedelySzam { get; set; }
    public DateTime? TagsagKezdete { get; set; }
    public DateTime? SportorvosiEngedely { get; set; }
}