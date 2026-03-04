namespace MusztangSE.Library.MODEL;

public class Szerepkor
{
    public int Id { get; set; }
    public string Nev { get; set; } = "";

    public ICollection<Felhasznalo> Felhasznalok { get; set; } = new List<Felhasznalo>();
}