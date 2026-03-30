using MusztangSE_WebAPI.SERVICES.Auth;

namespace MusztangSe.Teszt.Services;

public class PasswordServiceTests
{
    [Fact]
    public void Hash_NemAdjaVissza_AzEredetiJelszot()
    {
        var hash = PasswordService.Hash("Teszt1234!");
        Assert.NotEqual("Teszt1234!", hash);
    }

    [Fact]
    public void Hash_NemNull()
    {
        var hash = PasswordService.Hash("Teszt1234!");
        Assert.NotNull(hash);
    }

    [Fact]
    public void Verify_HelytesJelszoEseten_IgazatAd()
    {
        var hash = PasswordService.Hash("Teszt1234!");
        var result = PasswordService.Verify("Teszt1234!", hash);
        Assert.True(result);
    }

    [Fact]
    public void Verify_HelytElenJelszoEseten_HamisatAd()
    {
        var hash = PasswordService.Hash("Teszt1234!");
        var result = PasswordService.Verify("RosszJelszo!", hash);
        Assert.False(result);
    }

    [Fact]
    public void KetKulonbozoHash_UgyanazonJelszobol_NemEgyenlo()
    {
        var hash1 = PasswordService.Hash("Teszt1234!");
        var hash2 = PasswordService.Hash("Teszt1234!");
        Assert.NotEqual(hash1, hash2);
    }
}