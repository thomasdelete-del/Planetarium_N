# Planetarium 11 – Beta

`Planetarium_N` ist die Betaversion eines interaktiven, browserbasierten
Planetariums. Die Anwendung verbindet eine frei dreh- und zoombare Himmelskarte
mit didaktischen Szenen, astronomischen Simulationen, einem realistischen
Beobachtermodus und einem sensorbasierten Lagemodus für Smartphones und Tablets.

Die stabile Hauptversion wird getrennt im Repository
[`Planetarium-`](https://github.com/thomasdelete-del/Planetarium-) gepflegt.
Neue Funktionen werden zunächst hier getestet und erst nach ausdrücklicher
Freigabe in die Hauptversion übernommen.

## Online ausprobieren

Die Beta kann über GitHub Pages veröffentlicht und unter folgender Adresse
aufgerufen werden:

<https://thomasdelete-del.github.io/Planetarium_N/>

Für Kamera, Standort und Gerätesensoren ist ein sicherer HTTPS-Aufruf
erforderlich. Beim direkten Öffnen von `index.html` als lokale Datei stehen
diese Browserfunktionen meistens nicht zur Verfügung.

## Funktionsumfang

### Himmelskarte und Beobachtung

- Aktueller Sternhimmel für frei wählbare Orte, Daten und Uhrzeiten
- Kuppelansicht des gesamten sichtbaren Himmels
- Realistischer Beobachtermodus mit geradem Horizont und perspektivischem Blick
- Frei einstellbares Bildfeld bis zu starker teleskopischer Vergrößerung
- Sterne, Sternbilder, Sonne, Mond, Planeten und ausgewählte Deep-Sky-Objekte
- Einblendbare Sternbild-Linien, Tierkreiszeichen und astronomische Bezugskreise
- Dämmerung, Tageshimmel, Horizont, Planetenphasen und Mondbeleuchtung
- Informationen zu auswählbaren Objekten, darunter Helligkeit und Horizonthöhe

### Didaktische Szenen

Vordefinierte Sprünge stellen Ort, Datum, Uhrzeit und Ansicht passend zum
gewählten Thema ein. Dazu gehören unter anderem:

- Frühlings- und Herbstäquinoktium sowie Sommer- und Wintersonnenwende
- Polartag, Polarnacht und Beobachtungen vom Äquator bis zu den Polen
- Sonnen- und Mondfinsternisse
- Mondphasen und Planetenbeobachtung
- Tagesdrehung, Sonnenjahr und langfristige Präzession
- Lernansichten wichtiger Sternbilder und der Milchstraßenregion

Die Simulationen können mit unterschiedlichen Zeitgeschwindigkeiten laufen,
beispielsweise eine Minute, eine Stunde, einen Tag oder ein Jahr pro Sekunde.

## Lagemodus

Im Lagemodus folgt die virtuelle Kamera der räumlichen Ausrichtung des Geräts.
Die Rückseite des Smartphones oder Tablets entspricht dabei der Blickrichtung
einer realen Kamera: Wird das Gerät auf einen Bereich des Himmels gerichtet,
zeigt die Anwendung denselben simulierten Himmelsausschnitt.

- Ein einfaches Antippen zeigt Informationen zum erkannten Himmelsobjekt.
- Ein Doppeltipp reagiert wie im Beobachtermodus und schaltet die immersive
  Ansicht um.
- Der Kompass kann über **◎ Kalibrieren** auf die aktuelle Geräterichtung
  abgeglichen werden.
- Unplausible Sensorsprünge werden gefiltert und die Bewegung wird geglättet.
- Wenn kein absoluter Kompass oder kein geeigneter Lagesensor vorhanden ist,
  steht eine manuelle Pfeilsteuerung als Fallback zur Verfügung.

Die Genauigkeit hängt vom Magnetometer des Geräts und von magnetischen
Störquellen in der Umgebung ab. Bei einer ungenauen Richtung sollte das Gerät
kurz in Form einer Acht bewegt und anschließend neu kalibriert werden.

## Experimenteller VR-/Kamera-Modus

Der Schalter **📷 VR** erweitert den Lagemodus um ein Livebild der
rückseitigen Handykamera. Die berechnete Sternkarte wird halbtransparent über
das Kamerabild gelegt. Dadurch lassen sich simulierte Himmelsobjekte und der
reale Himmel unmittelbar miteinander vergleichen.

Beim Einschalten fordert der Browser die Kameraberechtigung an und aktiviert
bei Bedarf zugleich den Lagemodus. Beim Ausschalten des Lagemodus wird auch der
Kamerastream beendet, sodass die Kamera nicht unnötig im Hintergrund weiterläuft.

Der Modus ist experimentell. Abweichungen können unter anderem durch die
Kompassgenauigkeit, die Brennweite der eingebauten Kamera und ein abweichendes
Kamera-Sichtfeld entstehen.

## Sternkatalog

Der Rohkatalog `gaia_merged.bin` enthält 482.176 Sterne aus Gaia DR3. Für den
normalen Start lädt die Anwendung `gaia_compact.bin` mit 481.880 sortierten und
deduplizierten Datensätzen. Der kompakte Katalog reduziert Lade- und
Verarbeitungsaufwand. Importierte Rohkataloge werden in einem Web Worker
aufbereitet, damit die Benutzeroberfläche währenddessen bedienbar bleibt.

Die Gaia-Rohdatei ist etwa 17 MB groß und kann mit normalem Git verwaltet
werden; Git LFS ist dafür nicht erforderlich.

## Technischer Aufbau

Das Planetarium ist eine statische Webanwendung und benötigt keinen
Produktions-Build. `index.html` bindet die Stylesheets, die bestehenden
Legacy-Astronomiemodule und den modernen Modul-Bootstrap direkt ein.

Wichtige Verzeichnisse:

- `src/legacy/` – Rendering, astronomische Berechnungen und Simulationen
- `src/app/` – moderner Anwendungszustand und Bootstrap
- `src/ui/` – deklarative Bedienaktionen und Interaktionsadapter
- `src/styles/` – Darstellung und responsive Oberfläche
- `tests/` – automatisierte Vertrags-, Astronomie- und Zustandsprüfungen
- `scripts/` – Projektprüfung und Aufbereitung des Gaia-Katalogs

## Lokal starten

Ein lokaler HTTP-Server ist erforderlich, damit Module und Binärdateien korrekt
geladen werden. Beispielsweise mit Python:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Alternativ mit Node.js:

```powershell
npx serve . -l 4173
```

Danach <http://127.0.0.1:4173/> im Browser öffnen. Kamera, GPS und einige
Gerätesensoren können auf `localhost` funktionieren; für Tests auf einem
anderen Mobilgerät sollte die veröffentlichte HTTPS-Seite verwendet werden.

## Prüfen und testen

```powershell
npm test
npm run check
```

Oder beide Prüfschritte gemeinsam:

```powershell
npm run verify
```

Der Gaia-Katalog kann bei Bedarf neu erzeugt werden:

```powershell
npm run build:gaia
```

## Veröffentlichung mit GitHub Pages

1. Das Repository `Planetarium_N` auf GitHub öffnen.
2. **Settings → Pages** aufrufen.
3. Unter **Build and deployment** die Quelle **Deploy from a branch** wählen.
4. Den Branch **main** und den Ordner **/ (root)** auswählen.
5. Speichern und warten, bis GitHub die Veröffentlichung abgeschlossen hat.

Alle lokalen Ressourcen verwenden relative Pfade. Deshalb funktioniert die
Anwendung unter der GitHub-Pages-Projektadresse, ohne dass Pfade für die
Veröffentlichung angepasst werden müssen.

## Entwicklungsablauf

Neue und experimentelle Funktionen werden in `Planetarium_N` entwickelt und
getestet. `Planetarium-` bleibt davon unberührt. Eine getestete Beta wird nur
nach ausdrücklicher Entscheidung in das stabile Repository übernommen.
