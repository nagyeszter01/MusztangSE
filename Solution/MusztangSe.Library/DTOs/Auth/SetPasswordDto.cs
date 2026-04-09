namespace MusztangSe.Library.DTOs.Auth;

public class SetPasswordDto
{
    public string FelhasznaloAzonosito { get; set; }
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
}