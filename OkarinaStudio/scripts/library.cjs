const fs = require("fs");
const { Midi } = require("@tonejs/midi");
const C = require("../ui/core.js");
const html = fs.readFileSync("../Okarina_Editor_Tablet.html", "utf8");
const original = JSON.parse(
  html.match(/let data = (\{.*?\});\s*const POS/s)[1],
);
const songs = original.songs.map((s, i) => ({
  id: "original-" + i,
  title: s.title,
  family: "The Legend of Zelda",
  game: s.game,
  level: "beginner",
  bpm: 85,
  source:
    "Deine HTML-Vorlage · kurze Spielmelodie; gleichmäßige Übungsschritte ohne Originalrhythmus.",
  sections: s.sections.slice(0, 1).map((sec) => ({
    label: sec.label,
    events: sec.notes
      .split(/\s+/)
      .filter((n) => n !== "|")
      .map((note) => ({ note, beats: 1 })),
  })),
}));
const configs = [
  ["OOT__lostwoods.mid", 3, "Saria's Song", "Ocarina of Time", 0],
  ["OOT__windmillhut.mid", 7, "Song of Storms", "Ocarina of Time", 12],
  ["OOT__fairy.mid", 2, "Great Fairy Fountain", "Ocarina of Time", -12],
  [
    "The_Legend_of_Zelda_-_Majora__s_Mask__Clock_town.mid",
    0,
    "Clock Town",
    "Majora's Mask",
    12,
  ],
  [
    "The_Legend_of_Zelda_-_The_Wind_Waker__The_great_sea.mid",
    2,
    "The Great Sea",
    "The Wind Waker",
    12,
  ],
  ["Final_Fantasy_1__FF1prelu.mid", 2, "Prelude", "Final Fantasy I", 12],
  [
    "Final_Fantasy_7__1-05 Tifa's Theme Xg.mid",
    1,
    "Tifa's Theme",
    "Final Fantasy VII",
    0,
  ],
  [
    "Final_Fantasy_7__3-19 Aerith's Theme Xg.mid",
    1,
    "Aerith's Theme",
    "Final Fantasy VII",
    0,
  ],
  [
    "Final_Fantasy_8__1-02-Balamb_Garden.mid",
    1,
    "Balamb Garden",
    "Final Fantasy VIII",
    0,
  ],
  [
    "Final_Fantasy_8__3-20-Eyes_On_Me.mid",
    15,
    "Eyes on Me",
    "Final Fantasy VIII",
    0,
  ],
  [
    "Final_Fantasy_9__the_place_ill_return_to_someday.mid",
    0,
    "A Place to Call Home",
    "Final Fantasy IX",
    0,
  ],
  // Neue Einträge immer anhängen: die IDs der ausgelieferten Bibliothek bleiben stabil.
  [
    "Final_Fantasy_X__1-02 - To Zanarkand.mid",
    0,
    "To Zanarkand",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__3-21 - Suteki Da Ne (Isn't It Wonderful).mid",
    6,
    "Suteki da ne",
    "Final Fantasy X",
    12,
  ],
  [
    "Final_Fantasy_X__Besaid_Island.mid",
    4,
    "Besaid Island",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__FFX-Hymn_of_the_Fayth.mid",
    1,
    "Hymn of the Fayth",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__2-01 - Yunas_Theme.mid",
    15,
    "Yuna's Theme",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__1-04 - Tidus_Theme.mid",
    4,
    "Tidus's Theme",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__2-22 - Rikku.mid",
    9,
    "Rikku's Theme",
    "Final Fantasy X",
    12,
  ],
  [
    "Final_Fantasy_X__4-02 - Lulus Theme.mid",
    10,
    "Lulu's Theme",
    "Final Fantasy X",
    12,
  ],
  [
    "Final_Fantasy_X__2-12 - Aruons Theme.mid",
    8,
    "Auron's Theme",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__1-19 - Scenery of Spira.mid",
    3,
    "Scenery of Spira",
    "Final Fantasy X",
    12,
  ],
  [
    "Final_Fantasy_X__4-08 - Someday the Dream Will End.mid",
    12,
    "Someday the Dream Will End",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__2-04 - Silence_Before_The_Storm.mid",
    9,
    "Silence Before the Storm",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__3-01 - Thunder Plains.mid",
    3,
    "Thunder Plains",
    "Final Fantasy X",
    0,
  ],
  [
    "Final_Fantasy_X__4-07 - Wandering_Flames.mid",
    6,
    "Wandering Flames",
    "Final Fantasy X",
    24,
  ],
  [
    "Final_Fantasy_6_(US_FF3)__FF6_26_Terra.mid",
    11,
    "Terra's Theme",
    "Final Fantasy VI",
    0,
  ],
  [
    "Final_Fantasy_6_(US_FF3)__FF6_22_Celes_Theme.mid",
    11,
    "Celes's Theme",
    "Final Fantasy VI",
    0,
  ],
  [
    "Final_Fantasy_7__2-08 Cinco de Chocobo Xg.mid",
    1,
    "Cinco de Chocobo",
    "Final Fantasy VII",
    12,
  ],
  [
    "Final_Fantasy_9__melodies_of_life.mid",
    2,
    "Melodies of Life",
    "Final Fantasy IX",
    0,
  ],
  [
    "Kingdom_Hearts__Dearly_Beloved.mid",
    2,
    "Dearly Beloved",
    "Kingdom Hearts",
    0,
  ],
  ["Kingdom_Hearts__Kairi.mid", 1, "Kairi's Theme", "Kingdom Hearts", 0],
  [
    "Kingdom_Hearts__Destiny_Islands.mid",
    7,
    "Destiny Islands",
    "Kingdom Hearts",
    12,
  ],
  [
    "Kingdom_Hearts__Traverse_town.mid",
    1,
    "Traverse Town",
    "Kingdom Hearts",
    12,
  ],
  [
    "Kingdom_Hearts__Always_On_My_Mind.mid",
    7,
    "Always on My Mind",
    "Kingdom Hearts",
    0,
  ],
  [
    "Kingdom_Hearts__Hallow_Bastion.mid",
    1,
    "Hollow Bastion",
    "Kingdom Hearts",
    12,
  ],
  ["Kingdom_Hearts__Hand_In_Hand.mid", 13, "Hand in Hand", "Kingdom Hearts", 0],
  [
    "Kingdom_Hearts__Dive_Into_The_Heart.mid",
    21,
    "Dive into the Heart",
    "Kingdom Hearts",
    -12,
  ],
  [
    "Kingdom_Hearts__Wonderland.mid",
    3,
    "Welcome to Wonderland",
    "Kingdom Hearts",
    12,
  ],
  [
    "Kingdom_Hearts__Neverland_Sky.mid",
    1,
    "Never Land Sky",
    "Kingdom Hearts",
    0,
  ],
];

function excerpt(events, limit = 12) {
  const result = [];
  let notes = 0;
  for (const event of events) {
    if (event.note !== "R") notes++;
    if (event.note === "R" && notes >= 6 && event.beats >= 3) break;
    result.push({ ...event });
    if (notes >= limit) break;
  }
  while (result.at(-1)?.note === "R") result.pop();
  return result;
}

for (const [file, track, title, game, shift] of configs) {
  const midi = new Midi(fs.readFileSync("midis/" + file));
  const voice = midi.tracks[track];
  if (!voice?.notes.length)
    throw Error("Melodiestimme fehlt: " + file + " / " + track);
  const notes = voice.notes
    .slice()
    .sort((a, b) => a.ticks - b.ticks || b.midi - a.midi)
    .filter((note, i, list) => i === 0 || note.ticks !== list[i - 1].ticks);
  const events = [];
  let folds = 0,
    cursor = notes[0].ticks;
  function append(note, beats, baseFold = false) {
    // Long rests or held notes stay representable in the editor/import format.
    while (beats > 32) {
      events.push({ note, beats: 16, baseFold });
      beats -= 16;
    }
    events.push({ note, beats: +Math.max(0.0625, beats).toFixed(4), baseFold });
  }
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i],
      gap = (note.ticks - cursor) / midi.header.ppq;
    if (gap > 0 && gap <= 0.08 && events.length)
      events.at(-1).beats = +(events.at(-1).beats + gap).toFixed(4);
    else if (gap > 0.08) append("R", gap);
    const resolved = C.resolve(C.name(note.midi + shift), 0, true);
    if (resolved.shifted) folds++;
    const ticks = Math.min(
      note.durationTicks,
      (notes[i + 1]?.ticks ?? Infinity) - note.ticks,
    );
    append(resolved.note, ticks / midi.header.ppq, resolved.shifted);
    cursor = note.ticks + ticks;
  }
  const sections = [];
  for (let i = 0; i < events.length; i += 16)
    sections.push({
      label: "Abschnitt " + (sections.length + 1),
      events: events.slice(i, i + 16),
    });
  const family = file.startsWith("Kingdom_Hearts")
    ? "Kingdom Hearts"
    : file.startsWith("Final")
      ? "Final Fantasy"
      : "The Legend of Zelda";
  const isZelda = family === "The Legend of Zelda";
  const sourceUrl = file.includes("Besaid_Island")
    ? "https://www.hellandheavennet.com/final-fantasy-10/midis.php"
    : file.startsWith("OOT")
      ? "https://www.classiczelda.com/music/midi/zelda5/index.php"
      : "https://github.com/ryanrudes/game-midis";
  const attribution =
    game === "Final Fantasy X" && !file.includes("Besaid_Island")
      ? " Sammlung: Rikku’s World (Archiv von 2002, via game-midis)."
      : "";
  songs.push({
    id: "midi-" + songs.length,
    title,
    game,
    family,
    level: "advanced",
    bpm: Math.min(
      240,
      Math.max(30, Math.round(midi.header.tempos[0]?.bpm || 100)),
    ),
    source:
      "Einstimmige MIDI-Bearbeitung · ausgewählte Melodiestimme, keine vollständige Partitur. " +
      (shift ? "Stimme um " + shift + " Halbtöne oktavversetzt. " : "") +
      (folds
        ? folds + " einzelne Töne in den Okarina-Tonumfang oktaviert. "
        : "") +
      attribution,
    sourceUrl,
    sourceFile: file,
    sections,
  });
  if (!isZelda) {
    const short =
      songs.length < 30
        ? events.filter((e) => e.note !== "R").slice(0, 12)
        : excerpt(events);
    songs.push({
      id: "excerpt-" + songs.length,
      title,
      game,
      family,
      level: "beginner",
      bpm: 75,
      source:
        "Kurzer Einstiegsauszug aus der MIDI-Bearbeitung; nicht das ganze Lied." +
        attribution,
      sourceUrl,
      sourceFile: file,
      sections: [{ label: "Erste Melodiephrase", events: short }],
    });
  }
}

const output = {
  format: "okarina-studio-v1",
  fingerings: original.fingerings,
  songs,
  bundledIds: songs.map((s) => s.id),
  legacyBundledIds: songs.slice(0, 30).map((s) => s.id),
};
fs.writeFileSync(
  "ui/library.js",
  "window.LIBRARY = " + JSON.stringify(output) + ";\n",
);
console.log(
  songs.length +
    " Fassungen, davon " +
    songs.filter((s) => s.game === "Final Fantasy X").length +
    " aus Final Fantasy X.",
);
