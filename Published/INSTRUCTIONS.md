# Musztáng SE – Telepítési és futtatási útmutató

## Élő alkalmazás

Az alkalmazás az alábbi címen érhető el:

**[https://www.mustangse.hu](https://www.mustangse.hu)**

---

## Lokális futtatás

### Előfeltételek

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (SQL Server Express vagy újabb)
- [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (SSMS) – ajánlott
- [Visual Studio 2022](https://visualstudio.microsoft.com/) – ajánlott
- Git

---

### 1. Repository klónozása

```bash
git clone https://github.com/nagyeszter01/MusztangSE.git
cd MusztangSE
```

---

### 2. Adatbázis létrehozása

1. Nyissa meg az **SQL Server Management Studio**-t
2. Csatlakozzon a helyi SQL Express szerverhez: `localhost\SQLEXPRESS`
3. Importálja be a MusztangSE.bacpac fájlt

---

### 3. Backend konfigurálása

Nyissa meg a `MusztangSE_WebAPI/appsettings.json` fájlt, és ellenőrizze a connection stringet:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=MusztangSE;User Id=sa;Password=1A2w3e4F;TrustServerCertificate=True"
  }
}
```

> Amennyiben a jelszó vagy a szerver neve eltér, kérjük, módosítsa a fenti értékeket ennek megfelelően.

---

### 4. Backend indítása

```bash
cd MusztangSE_WebAPI
dotnet run
```

A backend alapértelmezetten a következő címen fut: `https://localhost:7001`

A Swagger felület elérhető: `https://localhost:7001/swagger`

---

### 5. Frontend indítása

Nyisson meg egy új terminált:

```bash
cd MusztangSE.Frontend
dotnet run
```

A frontend alapértelmezetten elérhető: `https://localhost:7089`

---

### 6. Tesztek futtatása

```bash
cd MusztangSE.Teszt
dotnet test
```

Sikeres futás esetén az alábbi kimenet jelenik meg:

```
Passed! - Failed: 0, Passed: 15, Skipped: 0, Total: 15
```

---

## Bejelentkezési adatok (teszteléshez)

| Azonosító  | Szerepkör     | Jelszó                  |
|------------|---------------|-------------------------|
| `N2E3D408` | Tag           | `VizsgaRemek123!`       |
| `R1V9PODW` | Tag           | `TagiJelszo123!`        |
| `H1OD63B9` | Edző (elnök)  | `EdzoElnok123!`         |
| `G3E9KF7R` | Edző          | `SimaEdzo123!`          |
| `ADMINNED` | Admin         | `ErosJelszoAdminhoz123!`|

---

## Projekt struktúra

```
MusztangSE/
├── MusztangSE_WebAPI/         # ASP.NET Core Web API backend (.NET 8)
├── MusztangSE.Frontend/       # Statikus frontend (HTML, CSS, JavaScript)
├── MusztangSe.Library/        # Közös modellek, DTO-k, DbContext
├── MusztangSE.Teszt/          # Unit tesztek (xUnit)
```

---

## Technológiák

| Réteg | Technológia |
|-------|-------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | ASP.NET Core Web API, C# (.NET 8) |
| ORM | Entity Framework Core  |
| Adatbázis | SQL Server (Database First) |
| Autentikáció | JWT token, szerepkör alapú jogosultságkezelés |
| Tesztelés | xUnit, Moq, EF Core InMemory |
| Hosting | Microsoft Azure |
