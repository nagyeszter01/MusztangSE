namespace MusztangSE.Library.MODEL;

public class Felhasznalo
{
    public int Id { get; set; }
    public string FelhasznaloAzonosito { get; set; } = "";
    public string? JelszoHash { get; set; }
    public bool Aktiv { get; set; } = true;

    public int SzerepkorId { get; set; }
    public Szerepkor? Szerepkor { get; set; }

    public int? EdzoId { get; set; }
    public Edzo? Edzo { get; set; }

    public int? TagId { get; set; }
    public Tagok? Tag { get; set; }

    public DateTime? PasswordSetAt { get; set; }
}