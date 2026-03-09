using System.Security.Cryptography; 
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace MusztangSE_WebAPI.SERVICES.Auth;

public class PasswordService
{
    // Jelszó hash-elése
    public static string Hash(string password)
    {
        // Salt generálás
        byte[] salt = new byte[128 / 8];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Hash készítése
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 10000,
            numBytesRequested: 256 / 8));

        // Salt és hash visszaadása egy stringben
        return $"{Convert.ToBase64String(salt)}.{hashed}";
    }

    // Jelszó ellenőrzése
    public static bool Verify(string password, string storedHash)
    {
        var parts = storedHash.Split('.');
        if (parts.Length != 2) return false;

        var salt = Convert.FromBase64String(parts[0]);
        var hash = parts[1];

        string hashedInput = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 10000,
            numBytesRequested: 256 / 8));

        return hash == hashedInput;
    }
}