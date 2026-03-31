# Musztáng SE – Vizsgaremek

Ez a repository a Musztáng SE sportegyesület számára készült webalkalmazást tartalmazza, amelyet vizsgafeladat keretében fejlesztettünk. Az alkalmazás egy teljes körű információs és adminisztrációs rendszer, amely a nyilvános egyesületi weboldalt és a bejelentkezett felhasználók zárt felületét egyaránt tartalmazza.

## Csapattagok

- **Nagy Eszter Dóra**
- **Zsitva Dániel Béla**

## Az alkalmazásról

A Musztáng SE Magyarország egyik meghatározó akrobatikus rock and roll sportegyesülete. A webalkalmazás célja az egyesület digitális jelenlétének megteremtése és a tagok, edzők, adminisztrátorok számára szükséges funkciók egy helyen való elérhetővé tétele.

### Funkciók

**Nyilvános főoldal**
- Egyesület bemutatása
- Edzők és elérhetőségek
- Edzések helyszínei interaktív Google Térképekkel
- Versenyeredmények kategóriánként (Területi, Országos, Magyar Bajnokság, Világbajnokság)
- Galéria oldal az egyesületről 

**Tagi felület**
- Személyes és sportolói adatok megtekintése és szerkesztése
- Közelgő versenyek megtekintése

**Edzői felület**
- Tagok nyilvántartása (felvétel, módosítás, törlés)
- Csapatok kezelése és archiválása
- Versenyeredmények rögzítése
- Közelgő versenyek kezelése
- Elnöki jogosultsággal: új edző felvétele

**Adminisztrátori felület**
- Felhasználók kezelése
- Edzők felügyelete
- Csapatok kezelése
- Versenyek kezelése
- Rendszerstatisztikák dashboard

## Technológiák

| Réteg | Technológia |
|-------|-------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | ASP.NET Core Web API, C# |
| ORM | Entity Framework Core 9 |
| Adatbázis | SQL Server (Database First) |
| Autentikáció | JWT token, szerepkör alapú jogosultságkezelés |
| Verziókezelés | Git, GitHub |
| Fejlesztői környezet | Visual Studio 2022, .NET 8 |

## Projekt struktúra
```
MusztangSE/
├── MusztangSE_WebAPI/         # ASP.NET Core Web API backend
│   ├── Controllers/
│   │   ├── Admin/             # Adminisztrátori kontrollerek
│   │   ├── Auth/              # Autentikációs kontrollerek
│   │   ├── Edzo/              # Edzői kontrollerek
│   │   ├── Kozos/             # Megosztott kontrollerek
│   │   └── Tag/               # Tagi kontrollerek
│   ├── Services/              # Üzleti logika szolgáltatások
│   └── Middleware/            # Kivételkezelő middleware
├── MusztangSE.Frontend/       # Statikus frontend
│   └── wwwroot/
│       ├── Fooldal/           # Nyilvános főoldal
│       ├── Bejelentkezes/     # Bejelentkezési oldalak
│       ├── Admin/             # Adminisztrátori felület
│       ├── Edzo/              # Edzői felület
│       └── Tag/               # Tagi felület
└── MusztangSe.Library/        # Közös könyvtár
    ├── MODEL/                 # Adatmodellek
    ├── DTOs/                  # Adatátviteli objektumok
    └── DATA/                  # DbContext, adatbázis konfiguráció
```


## Szerepkörök

| Szerepkör | Leírás |
|-----------|--------|
| `tag` | Saját adatok megtekintése és szerkesztése |
| `edzo` | Tagok, csapatok és eredmények kezelése |
| `admin` | Teljes rendszerfelügyelet |
