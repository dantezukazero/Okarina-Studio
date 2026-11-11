# Okarina Studio

Ein lokales Windows-Programm auf Grundlage von `../Okarina_Editor_Tablet.html`.

## Start

`../Okarina-Studio.exe` per Doppelklick starten. Keine Installation erforderlich. Die Original-HTML bleibt erhalten.

## Enthalten

- 66 Fassungen: Zelda sowie Final Fantasy I, VI, VII, VIII, IX und X. Neu sind 14 FFX-Melodien jeweils als kurzer Einstieg und als längere Melodiefassung, darunter To Zanarkand, Suteki da ne, Besaid Island und Hymn of the Fayth.
- Spielauswahl, Suchfeld, Einsteiger/Fortgeschrittene und Favoriten.
- Synthetische Tonwiedergabe mit Griffmarkierung, Tempo, Einzelschritten, Abschnittsauswahl und Wiederholen.
- Eigene Lieder mit Notenlängen und Pausen. Internationale Eingabe: B = deutsches H, A# = B. Anzeige verwendet H und B♭.
- Lokale automatische Speicherung, JSON-Sicherung und Import (auch alte `ocarina-tabs-v1`-Dateien), PDF- und SVG-Ausgabe des geöffneten Liedes.
- Beim Update werden neue Bibliothekseinträge ergänzt; bestehende Bearbeitungen, gelöschte Einträge, eigene Lieder, Favoriten und Einstellungen bleiben erhalten.
- Stimmungshilfe mit Grundgriff, Referenzton und lokalem Mikrofon-Stimmgerät. Manuelle Grundstimmung C4–C6, A4 = 440 Hz.

## Stimmung und dein Druck

Das Modell ist „Deluxe Ocarina – Fully Playable“ von Joce’s Designs: https://makerworld.com/de/models/1249288-deluxe-ocarina-fully-playable#profileId-1271476

Die Stimmung und tatsächlichen Griffe deines Resin-Drucks sind nicht verifiziert. „Griffe & erste Schritte“ erklärt, wie du den Grundgriff misst. Die gefüllten Kreise werden geschlossen; beide kleinen Zusatzlöcher bleiben beim C-Grundgriff offen.

Die Einstellung beschreibt den klingenden Ton dieses Grundgriffs. In G5 z. B. klingt der C-Grundgriff als G5; die App berechnet die passenden Griffe für die klingenden Melodietöne neu. Die Darstellung einer anderen Stimmung setzt dasselbe relative Griffsystem voraus. Einzelne verstimmte Löcher kann die globale Einstellung nicht korrigieren.

„Oktaven anpassen“ versetzt nicht erreichbare Melodietöne um ganze Oktaven. Diese Karten tragen ↕. Ohne Anpassung werden nicht spielbare Töne ausdrücklich angezeigt. Die Software stimmt das Instrument nicht physisch um.

Das Mikrofon wird erst nach „Mikrofon starten“ verwendet und beim Stoppen oder Schließen der Hilfe freigegeben. Audio wird lokal ausgewertet, nicht aufgenommen oder hochgeladen. Der erkannte stabile Ton muss zum beschriebenen Grundgriff gehören; mehrere Messungen und weitere Griffe dienen zur Gegenprüfung. Die Messung ist kein automatischer Nachweis einer korrekten Instrumentenstimmung.

## Noten und Quellen

Die 13 kurzen Zelda-Motive und alle Griffbelegungen stammen aus deiner HTML-Datei. Dort fehlten Notenlängen, deshalb laufen diese Motive in gleichmäßigen Übungsschritten. Noch nicht jedes kurze Motiv hat eine lange Gegenfassung.

Längere Fassungen sind einstimmige Bearbeitungen ausgewählter MIDI-Stimmen, keine vollständigen Originalpartituren. Oktaven und Mehrstimmigkeit wurden für eine einzelne Okarina angepasst. Quelle und Quelldatei stehen unter jedem Lied. Die musikalische Genauigkeit jeder einzelnen Transkription ist nicht unabhängig überprüft.

- Lost Woods, Windmill Hut, Fairy Fountain: https://www.classiczelda.com/music/midi/zelda5/index.php
- Übrige MIDI-Transkriptionen aus `Music.zip`: https://github.com/ryanrudes/game-midis (FFX-Archiv laut Quellenhinweis von Rikku's World, Stand 2002).
- Besaid Island: https://www.hellandheavennet.com/final-fantasy-10/midis.php
- Stimmung, Blasdruck und Griffe: https://pureocarinas.com/ocarina-breath-curves und https://pureocarinas.com/about-pure-ocarinas

Inoffizielles Fanprojekt. Zelda und Final Fantasy gehören ihren jeweiligen Rechteinhabern. Keine offiziellen Audiodateien oder Spielgrafiken enthalten. Rechte an Kompositionen und fremden MIDI-Transkriptionen werden nicht als eigene beansprucht. Original-MIDI-Dateien und heruntergeladene Archive werden nicht ins Git-Repository aufgenommen.

## Daten und Entwicklung

Eigene Bibliothek und Einstellungen: `%APPDATA%/okarina-studio/library.json`. Das portable Programm speichert somit dauerhaft im Windows-Benutzerprofil. Für einen Umzug zuerst „Bibliothek sichern“, dann auf dem anderen PC importieren. Import fügt Lieder hinzu und überschreibt keine bestehenden Lieder. Andere Grifftabellen werden beim Zusammenführen zurückgewiesen.

- `npm install`
- `npm start`
- `npm test`
- `node scripts/smoke.cjs`
- `node scripts/integration.cjs`
- `node scripts/update-smoke.cjs`
- `npm run build`
- `node scripts/packaged.cjs`
- Optional `npm run library:prepare`, um die mitgelieferte Bibliothek aus den dokumentierten Quelldateien neu zu erzeugen.

Electron stellt das Desktopfenster bereit. Oberfläche und Tonerzeugung funktionieren offline. Stimmgeräte-Algorithmus mit synthetischen Signalen bei 44,1 und 48 kHz geprüft; reales Mikrofon und gedrucktes Instrument müssen vor Ort geprüft werden. Die Windows-Datei ist nicht digital signiert.
