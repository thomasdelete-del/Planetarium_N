# Planetarium

Interaktives, browserbasiertes Planetarium mit didaktischen Szenen, Simulationen
und Sternbild-Lernmodus. Das Projekt benötigt keinen Build-Schritt und kann als
statische Website veröffentlicht werden.

Der Rohkatalog `gaia_merged.bin` liefert 482.176 Gaia-DR3-Sterne. Für den normalen
Start lädt die Anwendung direkt `gaia_compact.bin` mit 481.880 deduplizierten
Sternen. Importierte Rohkataloge werden in einem Web Worker aufbereitet, damit
die Oberfläche dabei bedienbar bleibt.

## Lokal starten

```powershell
npx serve . -l 4173
```

Danach `http://127.0.0.1:4173/` öffnen.

## Prüfen

```powershell
npm test
npm run check
npm run build:gaia
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
