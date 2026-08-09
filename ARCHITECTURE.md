# Planetarium-Architektur

## Aktueller Übergangszustand

Die ursprüngliche Einzeldatei wurde zunächst verlustfrei zerlegt. `src/legacy/01-core.js`
enthält den historischen Kern; die Dateien `02` bis `14` entsprechen den anschließend
angewendeten Erweiterungen. Ihre Reihenfolge darf bis zu ihrer Ablösung nicht verändert werden.

Neue Funktionalität greift nicht direkt auf globale Legacy-Variablen zu. Zustandswerte laufen
über `src/app/legacyAdapter.js`; noch globale Bedienfunktionen werden ausschließlich durch
die beiden UI-Adapter und ihren gemeinsamen `legacyFunctionResolver.js` aufgelöst.

Noch bestehende klassische Erweiterungsskripte verwenden ausschließlich die explizite
`window.__planetariumLegacy`-API aus `01-core.js`. Dynamisches `eval()` ist entfernt und wird
durch die Projektprüfung verhindert.

Der moderne Bootstrap liest seinen initialen Zustand ebenfalls über diese API. Damit stammen
Standort, Simulationszeit und Ansicht nicht mehr aus unzuverlässigen `window`-Nebenwirkungen.

## Zielregeln

1. Fachliche Berechnungen sind reine Funktionen in `src/astronomy/`.
2. Der Anwendungszustand wird nur per Store-Aktion geändert.
3. Canvas-Ausgabe wird als geordnete Liste unabhängiger Render-Layer aufgebaut.
4. Szenen sind Datenobjekte und keine langen Dispatcher-Funktionen.
5. DOM-Ereignisse werden in UI-Modulen registriert; neue Inline-Handler sind verboten.
6. Jeder extrahierte Bereich erhält Tests, bevor die Legacy-Implementierung entfernt wird.

## Szenen

`src/features/scenes/sceneCatalog.js` ist das verbindliche Inventar aller aus der Oberfläche
erreichbaren Szenen. Ein Test gleicht den Katalog mit sämtlichen `jumpScene(...)`-Verwendungen
im HTML ab. HTML-Schaltflächen enthalten ausschließlich `data-scene-id`; `bindSceneButtons.js`
delegiert alle Klicks an den Controller. Dieser validiert die ID, aktualisiert den Store und
delegiert während der Migration noch an den alten Dispatcher.

Sämtliche Klicks verwenden `data-action` und den generischen Dispatcher in
`src/ui/bindActions.js`. Formularereignisse laufen getrennt über `src/ui/bindInputs.js`.
Die Dispatcher sind frei von Legacy-Namen; die vorübergehende Zuordnung zu globalen
Funktionen liegt ausschließlich in `legacyUiActions.js` und `legacyInputActions.js`.
Datei-, Audio-, GPS- und Sensoraktionen werden synchron im ursprünglichen Nutzerereignis
delegiert, damit die Browserfreigaben erhalten bleiben. Vertragstests gleichen alle im HTML
verwendeten Aktionsnamen mit den Registern ab und verbieten Inline-Ereignishandler.

## Canvas-Rendering

Zusätzliche Ebenen ersetzen `draw()` nicht mehr direkt. Der Kern stellt mit
`registerAfterDraw(name, hook)` und `registerAroundDraw(name, middleware)` geordnete,
benannte Erweiterungspunkte bereit. Alle früheren Zeichen-Wrapper sind migriert. Around-Hooks
erhalten `{name, args, thisArg, next}` und müssen `next(...args)` genau einmal aufrufen.

## Empfohlene nächste Extraktionsreihenfolge

1. Koordinaten und Präzession
2. Mond und Planeten
3. Szenen-Registry und Szenen-Controller
4. Render-Pipeline und einzelne Ebenen
5. Standort, Zeitsteuerung und Gerätelage
6. Didaktik, Dialoge und übrige Oberfläche
