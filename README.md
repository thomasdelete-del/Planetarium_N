# Planetarium

Interaktives, browserbasiertes Planetarium mit didaktischen Szenen, Simulationen
und Sternbild-Lernmodus. Das Projekt benötigt keinen Build-Schritt und kann als
statische Website veröffentlicht werden.

Der enthaltene Katalog `gaia_merged.bin` liefert 482.176 Gaia-DR3-Sterne. Die
Anwendung findet ihn beim Start automatisch, bereitet ihn einmalig auf und legt
die optimierte Fassung anschließend im Browser-Speicher ab.

## Lokal starten

```powershell
npx serve . -l 4173
```

Danach `http://127.0.0.1:4173/` öffnen.

## Prüfen

```powershell
npm test
npm run check
```

## GitHub Pages

1. Das Repository auf GitHub öffnen.
2. Unter **Settings → Pages** bei **Source** die Option **Deploy from a branch** wählen.
3. Den Branch **main** und den Ordner **/ (root)** auswählen.
4. Speichern und warten, bis die Veröffentlichung abgeschlossen ist.

Die Anwendung verwendet relative Ressourcenpfade und funktioniert daher auch
unter einer Projektadresse wie `https://BENUTZERNAME.github.io/planetarium/`.

Die Gaia-Datei ist rund 17 MB groß und kann direkt mit normalem Git übertragen
werden; Git LFS ist dafür nicht erforderlich.
