(function (root) {
  "use strict";
  // Canonical UI text remains German. User-entered song data is never translated.
  const en = {
    "STUDIO / DEIN MUSIKABENTEUER": "STUDIO / YOUR MUSICAL ADVENTURE",
    "DEINE BIBLIOTHEK": "YOUR LIBRARY",
    "Alle Melodien": "All melodies",
    "Meine Favoriten": "My favorites",
    SPIELEWELTEN: "GAME WORLDS",
    "Deine 12-Loch-Okarina": "Your 12-hole ocarina",
    Sprache: "Language",
    "Weitere Spielewelten": "Additional game worlds",
    Zusatzsammlungen: "Additional collections",
    "Griffe & erste Schritte ↗": "Fingerings & first steps ↗",
    "Bibliothek sichern": "Back up library",
    "JSON importieren": "Import JSON",
    "Alles lokal · offline spielbar": "Stored locally · works offline",
    "DEIN NÄCHSTES ABENTEUER BEGINNT MIT EINEM TON":
      "YOUR NEXT ADVENTURE BEGINS WITH A NOTE",
    "＋ Eigenes Lied": "＋ Add your own song",
    "SPIELEN. ÜBEN. ERINNERN.": "PLAY. PRACTICE. REMEMBER.",
    "Melodien, die bleiben.": "Melodies that stay with you.",
    "Von den ersten sechs Tönen bis zur großen Spielmelodie.":
      "From your first six notes to the melodies of Hyrule.",
    "Dein Tempo.": "Your pace.",
    "Dein Abenteuer.": "Your adventure.",
    "Eine kleine Okarina.": "One little ocarina.",
    "Eine ganze Welt voller Musik.": "A whole world of music.",
    "Beginne mit den kurzen Spielmelodien aus Hyrule.":
      "Start with the short in-game melodies from Hyrule.",
    "Wachse mit längeren Fassungen über dich hinaus.":
      "Build your confidence with longer arrangements.",
    "In Hyrule anfangen →": "Start in Hyrule →",
    "Final Fantasy X entdecken →": "Explore Final Fantasy X →",
    "Kingdom Hearts entdecken →": "Explore Kingdom Hearts →",
    "12 LÖCHER. UNENDLICH VIELE GESCHICHTEN.": "12 HOLES. COUNTLESS STORIES.",
    "Deine Melodien": "Your melodies",
    "Lied oder Spiel suchen …": "Search songs or games …",
    "Lied oder Spiel suchen": "Search songs or games",
    "Lied auswählen": "Select song",
    Alle: "All",
    Einsteiger: "Beginner",
    Fortgeschritten: "Advanced",
    "Alle Spiele": "All games",
    "Spiel auswählen": "Select game",
    Melodien: "Melodies",
    "Mit jedem Ton ein bisschen weiter.": "A little further with every note.",
    "Inoffizielles Fanprojekt · keine Verbindung zu Nintendo oder Square Enix":
      "Unofficial fan project · not affiliated with Nintendo, Square Enix or Disney",
    "Inoffizielles Fanprojekt · keine Verbindung zu Nintendo, Square Enix oder Disney":
      "Unofficial fan project · not affiliated with Nintendo, Square Enix or Disney",
    Liedwerkstatt: "Song workshop",
    Titel: "Title",
    Spielreihe: "Game series",
    "Spiel / Teil": "Game / installment",
    "Eigene Sammlung": "My collection",
    Schwierigkeit: "Difficulty",
    "Tempo (BPM)": "Tempo (BPM)",
    "Abschnitte und Töne": "Sections and notes",
    "Je Zeile ein Abschnitt:": "One section per line:",
    "Notenlänge in Schlägen nach dem Doppelpunkt. R = Pause. B = deutsches H. Ohne Länge = 1 Schlag.":
      "Add the duration in beats after a colon. R = rest. Use international B (German H). Default duration = 1 beat.",
    "Lied löschen": "Delete song",
    "Lied speichern": "Save song",
    "Dein erster Ton": "Your first note",
    "Die gefüllten Kreise zeigen geschlossene Löcher. Die zwei Kreise unter der Trennlinie sind die Daumenlöcher; die kleinen Kreise sind die Zusatzlöcher.":
      "Filled circles indicate covered holes. The two circles below the line are the thumb holes; the small circles are the subholes.",
    "Was bedeutet „in C“?": "What does ‘in C’ mean?",
    "Beim C-Grundgriff sind die acht großen Fingerlöcher und beide Daumenlöcher zu, die zwei kleinen Zusatzlöcher offen. Eine übliche Okarina in C spielt dabei C5. Ihre Standardspanne reicht von A4 bis F6.":
      "For the C fingering, cover the eight main finger holes and both thumb holes, leaving both small subholes open. A standard C ocarina produces C5 with this fingering. Its usual range is A4 to F6.",
    "Dein Modell:": "Your model:",
    "von Joce’s Designs. Die tatsächliche Stimmung deines Resin-Drucks ist noch nicht geprüft. Vergleiche den C-Grundgriff mit dem Referenzton. Über „Stimmung“ wird die gemessene Grundstimmung eingestellt. Die App berechnet dann die Griffe für alle Melodien neu; nötige Oktavänderungen werden markiert.":
      "by Joce’s Designs. The actual tuning of your resin print has not been verified. Compare its C fingering with the reference tone. Set the measured base note under ‘Tuning’. The app recalculates the fingerings for every melody and marks any octave adjustments.",
    "Die Griffbelegungen stammen aus deiner HTML-Vorlage und müssen zu deinem Instrument passen. Besonders Zusatzlöcher und hohe Töne können abweichen.":
      "The fingerings come from the original HTML template and must match your instrument. Subholes and high notes in particular may differ.",
    "So übst du:": "How to practice:",
    "Erst die Einsteigermotive langsam spielen, dann in Abschnitten wiederholen. Fortgeschrittene Fassungen sind längere, einstimmige Bearbeitungen aus MIDI-Transkriptionen. Oktavversetzungen sind gekennzeichnet. Die alten Motive hatten keine Rhythmusangaben und werden deshalb zunächst in gleich langen Schritten gespielt.":
      "Start by playing the beginner motifs slowly, then repeat individual sections. Advanced versions are longer, single-voice arrangements of MIDI transcriptions. Octave shifts are marked. The original short motifs had no rhythm information, so they use equal-length practice steps.",
    "Leertaste: Start / Pause · ← / →: Ton wechseln. Eigene Lieder werden automatisch auf diesem PC gespeichert. Sichere sie zusätzlich als JSON.":
      "Space: play / pause · ← / →: previous / next note. Your songs are saved automatically on this PC. Keep an additional JSON backup.",
    "Welche Stimmung hat meine Okarina?": "What key is my ocarina in?",
    "1. Instrument kurz einspielen. Acht große Fingerlöcher und beide Daumenlöcher vollständig schließen; beide kleinen Zusatzlöcher offen lassen.":
      "1. Warm up your instrument briefly. Fully cover the eight main finger holes and both thumb holes; leave both small subholes open.",
    "2. Einen ruhigen, klaren Ton mit natürlichem Blasdruck halten. Nicht durch stärkeres Blasen einen bestimmten Ton erzwingen.":
      "2. Hold a steady, clear tone with natural breath pressure. Do not blow harder to force a particular note.",
    "3. Mehrfach messen. Der stabile Ton ist ein Hinweis auf die Grundstimmung. Prüfe danach weitere Griffe.":
      "3. Measure several times. A stable note suggests the base tuning. Check other fingerings afterwards.",
    "C5 anhören": "Hear C5",
    "Mikrofon starten": "Start microphone",
    "Messung stoppen": "Stop measuring",
    "Mikrofon nur während der Messung aktiv. Verarbeitung bleibt auf diesem PC.":
      "The microphone is only active during measurement. Processing stays on this PC.",
    "Gemessenen Grundton übernehmen": "Use measured base note",
    "Oder manuell wählen:": "Or select manually:",
    Übernehmen: "Apply",
    "Die Messung prüft keine einzelnen Tonlöcher. Weichen die Griffe untereinander ab, reicht eine globale Stimmungseinstellung nicht aus. Kleine Cent-Abweichungen entstehen auch durch Atemdruck und Temperatur. Referenz: A4 = 440 Hz.":
      "This measurement does not check individual tone holes. If fingerings are inconsistent, a global tuning setting cannot correct them. Breath pressure and temperature also cause small pitch deviations. Reference: A4 = 440 Hz.",
    "Stabiler Ton erkannt. Nur übernehmen, wenn du den beschriebenen Grundgriff hältst.":
      "Stable note detected. Only apply it while holding the base fingering described above.",
    "Ton ruhig halten – mehrere Messungen werden verglichen.":
      "Hold the note steadily — comparing several measurements.",
    "Kein stabiler Ton. Näher ans Mikrofon gehen und Nebengeräusche reduzieren.":
      "No stable note. Move closer to the microphone and reduce background noise.",
    "Mikrofon nicht verfügbar oder Zugriff verweigert. Du kannst den Vergleichston und die manuelle Auswahl verwenden.":
      "Microphone unavailable or access denied. You can still use the reference tone and manual selection.",
    "Dieser Grundton liegt außerhalb C4–C6. Bitte Griff und Messung prüfen.":
      "This base note is outside C4–C6. Check the fingering and measurement.",
    "Hier ist es noch still.": "No melodies here yet.",
    "Ändere die Suche oder lege ein eigenes Lied an.":
      "Try another search or add your own song.",
    "Favorit umschalten": "Toggle favorite",
    "Einsteiger · kurz": "Beginner · short",
    "Fortgeschritten · lang": "Advanced · long",
    Bearbeiten: "Edit",
    "PDF speichern": "Save PDF",
    "SVG speichern": "Save SVG",
    "▶ Abspielen": "▶ Play",
    "Ⅱ Pause": "Ⅱ Pause",
    "Vorheriger Ton": "Previous note",
    "Nächster Ton": "Next note",
    "Zum Anfang": "Back to start",
    Wiederholen: "Repeat",
    Tempo: "Tempo",
    Stimmung: "Tuning",
    "Oktaven anpassen": "Adjust octaves",
    "Stimmung finden ↗": "Find tuning ↗",
    Üben: "Practice",
    "Ganzes Lied": "Whole song",
    Pause: "Rest",
    Daumen: "Thumbs",
    "Außerhalb des Umfangs": "Out of range",
    "● Gefüllt = schließen · ○ Leer = offen · unten = Daumen":
      "● Filled = cover · ○ Empty = open · below = thumbs",
    "Anzeige: klingende Töne · B wird als deutsches H angezeigt · Griffsystem aus deiner Vorlage":
      "Display: sounding notes · international B notation · fingerings from the original template",
    "Eigene Melodie": "Your own melody",
    "Eigene oder selbst bearbeitete Melodie.": "Your own or edited melody.",
    "Wird gespeichert …": "Saving …",
    "Gespeichert auf diesem PC · offline": "Saved on this PC · offline",
    "Speichern fehlgeschlagen – JSON sichern":
      "Could not save — back up as JSON",
    "Bibliothek gesichert.": "Library backed up.",
    "PDF gespeichert.": "PDF saved.",
    "SVG gespeichert.": "SVG saved.",
    "Ein Lied muss erhalten bleiben.": "At least one song must remain.",
    "Mindestens ein Abschnitt ist nötig.": "At least one section is required.",
    "Bitte Titel und Spiel eingeben.": "Please enter a title and game.",
    "Dieses Lied löschen? Ein Backup lässt sich später wieder importieren.":
      "Delete this song? You can reimport a backup later.",
    "Keine gültige Okarina-Bibliothek (1–500 Lieder erforderlich).":
      "Invalid ocarina library (1–500 songs required).",
    "Leerer Abschnitt.": "Empty section.",
    "Ungültiger Ton oder ungültige Notenlänge.": "Invalid note or duration.",
    "Bibliothek enthält zu viele Töne.": "The library contains too many notes.",
    "Doppelte Lied-IDs.": "Duplicate song IDs.",
    "Mehr als 500 Lieder: Import zu groß.":
      "More than 500 songs: import is too large.",
    "Abweichende Grifftabelle: Diese Datei verwendet andere Griffe.":
      "Incompatible fingering chart: this file uses different fingerings.",
    "Notenlänge muss zwischen 0 und 32 liegen.":
      "Note duration must be greater than 0 and at most 32 beats.",
    Melodie: "Melody",
    "Erste Melodiephrase": "Opening melody phrase",
    Spielmelodie: "In-game motif",
    "Gefüllt = schließen · unten = Daumen · ↕ = oktavversetzt · Längen in Schlägen":
      "Filled = cover · below = thumbs · ↕ = octave shift · durations in beats",
  };
  let locale = "de";
  function text(value, language = locale) {
    const raw = String(value ?? "");
    if (language !== "en") return raw;
    const normalized = raw.trim().replace(/\s+/g, " ");
    if (!normalized) return raw;
    let result = en[normalized];
    if (result === undefined) {
      result = normalized
        .replace(/^(\d+) Fassungen$/, "$1 arrangements")
        .replace(/^(\d+) Töne$/, "$1 notes")
        .replace(/^Abschnitt (\d+)$/, "Section $1")
        .replace(/^Spielmelodie \((\d+) Töne\)$/, "In-game motif ($1 notes)")
        .replace(
          /^((?:\d+\.)?\d+(?:\.\d+)?) (?:Schlag|Schläge)(?= ·|$)/,
          "$1 beats",
        )
        .replace(/, ([\d.]+) Schläge$/, ", $1 beats")
        .replace(
          /^↕ (\d+) Töne sind für den Tonumfang oktavversetzt\. Markierte Karten zeigen die angepasste Fassung\.$/,
          "↕ $1 notes have been shifted by octaves to fit the range. Marked cards show the adjusted version.",
        )
        .replace(
          /^(\d+) Töne liegen außerhalb des Tonumfangs\. Aktiviere die Oktavanpassung oder verwende eine andere Fassung\.$/,
          "$1 notes are outside the range. Enable octave adjustment or choose another arrangement.",
        )
        .replace(
          /^(\d+) neue Fassungen ergänzt – deine Lieder und Einstellungen bleiben erhalten\.$/,
          "$1 new arrangements added — your songs and settings have been preserved.",
        )
        .replace(
          /^(\d+) Lieder hinzugefügt\. Bestehende Lieder bleiben erhalten\.$/,
          "$1 songs added. Existing songs have been preserved.",
        )
        .replace(
          /^Stimmung (\S+) übernommen\. Alle Griffbilder neu berechnet\.$/,
          "Tuning $1 applied. All fingerings recalculated.",
        )
        .replace(/^Lied (\d+) ist unvollständig\.$/, "Song $1 is incomplete.");
      const fragments = [
        ["Kurze Einstiegsfassung", "Short beginner arrangement"],
        ["Längere Melodiefassung", "Longer melody arrangement"],
        [" · Standard", " · Default"],
        [" · Griff ", " · Fingering "],
        ["Griff für ", "Fingering for "],
        ["Griff ", "Fingering "],
        ["12-Loch-Okarina · Stimmung ", "12-hole ocarina · Tuning "],
        [" · klingende Töne", " · sounding notes"],
        [
          "Deluxe Ocarina · gedrucktes Modell",
          "Deluxe Ocarina · printed model",
        ],
        ["Stimmung: ", "Tuning: "],
        ["Stimmung ", "Tuning "],
        ["Quelle: ", "Source: "],
        [" Cent", " cents"],
        [
          "Einstimmige MIDI-Bearbeitung · ausgewählte Melodiestimme, keine vollständige Partitur.",
          "Single-voice MIDI arrangement · selected melody voice, not a full score.",
        ],
        [
          "Kurzer Einstiegsauszug aus der MIDI-Bearbeitung; nicht das ganze Lied.",
          "Short beginner excerpt from the MIDI arrangement; not the complete song.",
        ],
        [
          "Deine HTML-Vorlage · kurze Spielmelodie; gleichmäßige Übungsschritte ohne Originalrhythmus.",
          "Original HTML template · short in-game motif; equal practice steps without the original rhythm.",
        ],
        [
          " Sammlung: Rikku’s World (Archiv von 2002, via game-midis).",
          " Collection: Rikku’s World (2002 archive, via game-midis).",
        ],
        ["Speichern fehlgeschlagen: ", "Could not save: "],
        ["Audio konnte nicht gestartet werden: ", "Could not start audio: "],
        ["PDF fehlgeschlagen: ", "PDF export failed: "],
        ["SVG fehlgeschlagen: ", "SVG export failed: "],
        ["Sichern fehlgeschlagen: ", "Backup failed: "],
        ["Import fehlgeschlagen: ", "Import failed: "],
        [
          "Gespeicherte Bibliothek konnte nicht geladen werden: ",
          "Could not load the saved library: ",
        ],
        ["Ungültige Eingabe: ", "Invalid input: "],
        ["Ungültiger Ton: ", "Invalid note: "],
        ["Unbekannter Ton: ", "Unknown note: "],
        [
          "Außerhalb der C-Vorlage (A4–F6): ",
          "Outside the C template range (A4–F6): ",
        ],
        ["Abschnitt ohne Töne: ", "Section without notes: "],
        ["Ungültige Grifftabelle für ", "Invalid fingering chart for "],
      ];
      for (const [de, english] of fragments)
        result = result.split(de).join(english);
      result = result
        .replace(
          /Stimme um (-?\d+) Halbtöne oktavversetzt\./g,
          "Voice shifted by $1 semitones in whole octaves.",
        )
        .replace(
          /(\d+) einzelne Töne in den Okarina-Tonumfang oktaviert\./g,
          "$1 individual notes shifted by octaves to fit the ocarina range.",
        );
      result = result.replace(/^1 beats(?= ·|$)/, "1 beat");
      result = result.replace(/^Pause, /, "Rest, ");
      // Error messages may combine a translated prefix with a full message.
      for (const [de, english] of Object.entries(en))
        if (result.endsWith(de)) {
          result = result.slice(0, -de.length) + english;
          break;
        }
    }
    return raw.match(/^\s*/)[0] + result + raw.match(/\s*$/)[0];
  }
  const originals = new WeakMap(),
    attributes = new WeakMap();
  function apply() {
    if (typeof document === "undefined") return;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let node; (node = walker.nextNode());) {
      if (
        !node.parentElement ||
        node.parentElement.closest(
          "script,style,textarea,code,[data-user-text],.song-card strong,.song-card small,.practice h2",
        )
      )
        continue;
      let saved = originals.get(node);
      if (!saved || node.nodeValue !== saved.last)
        saved = { original: node.nodeValue, last: node.nodeValue };
      if (
        node.parentElement.tagName === "OPTION" &&
        !node.parentElement.hasAttribute("value")
      )
        node.parentElement.value = saved.original.trim();
      const translated = text(saved.original);
      saved.last = translated;
      originals.set(node, saved);
      if (node.nodeValue !== translated) node.nodeValue = translated;
    }
    for (const element of document.querySelectorAll(
      "[placeholder],[aria-label],[title]",
    )) {
      if (element.closest("[data-user-text]")) continue;
      const saved = attributes.get(element) || {};
      for (const key of ["placeholder", "aria-label", "title"]) {
        if (!element.hasAttribute(key)) continue;
        const value = element.getAttribute(key);
        if (!saved[key] || saved[key].last !== value)
          saved[key] = { original: value, last: value };
        const translated = text(saved[key].original);
        saved[key].last = translated;
        if (value !== translated) element.setAttribute(key, translated);
      }
      attributes.set(element, saved);
    }
  }
  function setLanguage(language) {
    locale = language === "en" ? "en" : "de";
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.getElementById("language").value = locale;
      apply();
    }
  }
  function start() {
    apply();
    new MutationObserver(apply).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  }
  function localizeSvg(svg) {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    // The first two text elements contain the user's song title and game name.
    [...doc.querySelectorAll("text")]
      .slice(2)
      .forEach((node) => (node.textContent = text(node.textContent)));
    doc
      .querySelectorAll("[aria-label]")
      .forEach((node) =>
        node.setAttribute("aria-label", text(node.getAttribute("aria-label"))),
      );
    return new XMLSerializer().serializeToString(doc.documentElement);
  }
  const api = {
    text,
    setLanguage,
    start,
    apply,
    localizeSvg,
    get language() {
      return locale;
    },
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.I18n = api;
})(globalThis);
