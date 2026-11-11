# Okarina Studio

Ein deutschsprachiges Windows-Lernprogramm für die 12-Loch-Okarina: Spielebibliothek, Griffbilder, Melodiewiedergabe, Übungsmodus und eine Hilfe zum Bestimmen der Instrumentenstimmung. Alles läuft lokal und offline; ein Mikrofon wird nur auf Knopfdruck für das Stimmgerät verwendet.

## Version 1.1 – mehr Final Fantasy, besonders FFX

Die Bibliothek umfasst **66 Fassungen**. **14 Melodien aus Final Fantasy X** gibt es jeweils als kurzen Einstieg und als längere einstimmige Bearbeitung:

| Final Fantasy X | Final Fantasy X |
| --- | --- |
| To Zanarkand | Suteki da ne |
| Besaid Island | Hymn of the Fayth |
| Yuna's Theme | Tidus's Theme |
| Rikku's Theme | Lulu's Theme |
| Auron's Theme | Scenery of Spira |
| Someday the Dream Will End | Silence Before the Storm |
| Thunder Plains | Wandering Flames |

Außerdem: Zelda (Ocarina of Time, Majora's Mask, The Wind Waker) sowie Final Fantasy I, VI, VII, VIII und IX – darunter Terra's Theme, Celes's Theme, Tifa's Theme, Aerith's Theme, Eyes on Me und Melodies of Life.

## Funktionen

- Bibliothek nach Spielreihe, Spiel, Schwierigkeit, Suchbegriff und Favoriten.
- Kurze Einstiege und längere Melodiefassungen mit Griffbildern für jeden Ton.
- Hörbare Referenztöne, Abspielen mit Markierung, Tempo, einzelne Schritte und Abschnittsschleifen.
- Stimmung manuell einstellen oder mit einem Mikrofon bestimmen; Griffe werden entsprechend neu berechnet.
- Sichtbar markierte Oktavanpassung für Töne außerhalb des Instrumentenumfangs.
- Eigene Lieder mit Notenlängen und Pausen, automatische Speicherung, JSON-Import/-Export, PDF und SVG.
- Neue Bibliotheksinhalte werden beim Update ergänzt. Eigene Lieder, bearbeitete oder gelöschte Einträge, Favoriten und Einstellungen bleiben erhalten.

## Gedruckte Okarina

Dieses Projekt entstand für eine mit einem Resin-Drucker gefertigte **„Deluxe Ocarina – Fully Playable“ von Joce's Designs**:

**[Modell und verwendetes Druckprofil auf MakerWorld](https://makerworld.com/de/models/1249288-deluxe-ocarina-fully-playable#profileId-1271476)**

Die tatsächliche Stimmung dieses Drucks ist noch nicht verifiziert. Die App erklärt unter **„Griffe & erste Schritte“**, wie man den Grundgriff spielt, den klingenden Ton misst und die passende Stimmung einstellt. Die Ausgangsgriffe stammen aus der ursprünglichen HTML-Vorlage und setzen das entsprechende 12-Loch-Griffsystem voraus.

## Starten und bauen

Mit Node.js und npm im Quellverzeichnis:

```powershell
cd OkarinaStudio
npm ci
npm start
```

Die portable Windows-Datei erzeugen:

```powershell
npm run build
```

Ergebnis: `OkarinaStudio/dist/Okarina-Studio.exe`. Per Doppelklick starten, keine Installation nötig. Die Datei wird nicht als Git-Quelldatei eingecheckt.

Eigene Daten liegen unter `%APPDATA%/okarina-studio/library.json`. Eine zusätzliche JSON-Sicherung lässt sich in der App anlegen. Sie enthält auch die Einstellungen. Bei einem Update die bisherige App schließen und die neue Version starten.

## Entwicklung und Prüfung

```powershell
cd OkarinaStudio
npm test
npm run test:ui
npm run build
node scripts/packaged.cjs
```

Die Tests prüfen unter anderem Transposition, Notenparser, synthetische Stimmgerätetöne, Datenmigration, Wiedergabe, Import/Export und die gepackte Windows-App. Eine Messung mit dem echten Mikrofon und dem gedruckten Instrument muss vor Ort erfolgen.

Die mitgelieferte `ui/library.js` reicht zum Starten und Bauen aus. Zum erneuten Erzeugen der Bibliothek aus den dokumentierten MIDI-Quellen dient `npm run library:prepare`. Es lädt die MIDI-Sammlung in ein lokal ignoriertes Verzeichnis; `scripts/library.cjs` dokumentiert die verwendeten Dateien, Stimmen und Oktavverschiebungen.

## Quellen und Einordnung

Die langen Fassungen sind **einstimmige Bearbeitungen ausgewählter MIDI-Stimmen**, keine vollständigen Originalpartituren. Die Okarina kann Begleitung und Mehrstimmigkeit nicht vollständig wiedergeben. Die kurzen Fassungen sind Ausschnitte zum Einsteigen; „Einsteiger“ bedeutet nicht, dass alle enthaltenen chromatischen Griffe sofort leicht sind. Quelle und Bearbeitung stehen beim jeweiligen Lied.

- Die Zelda-Spielmotive und Ausgangsgriffe stammen aus `Okarina_Editor_Tablet.html`.
- [Ocarina-of-Time-MIDI-Transkriptionen bei Classic Zelda](https://www.classiczelda.com/music/midi/zelda5/index.php).
- [Video-Game-MIDI-Sammlung von ryanrudes](https://github.com/ryanrudes/game-midis); die darin enthaltene FFX-Sammlung stammt laut Archivhinweis von Rikku's World (Stand 2002). Einzelne Urheber sind im Archiv teilweise nicht ausgewiesen.
- [Besaid Island bei Hell and Heaven Net](https://www.hellandheavennet.com/final-fantasy-10/midis.php).
- [Blasdruck und Stimmung bei Pure Ocarinas](https://pureocarinas.com/ocarina-breath-curves).

Inoffizielles Fanprojekt ohne Verbindung zu Nintendo oder Square Enix. Marken, Kompositionen und fremde Transkriptionen gehören ihren jeweiligen Rechteinhabern; für sie wird keine eigene Urheberschaft oder freie Lizenz behauptet. Die heruntergeladenen MIDI-Archive und Original-MIDI-Dateien sind nicht Bestandteil des Git-Repositories.
