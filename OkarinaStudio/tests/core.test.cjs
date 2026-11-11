const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  C = require("../ui/core.js");
const fs = require("fs"),
  vm = require("vm");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync("ui/library.js", "utf8"), sandbox);
const lib = sandbox.window.LIBRARY;
test("Stimmung in G berechnet Griffe für klingende Töne", () => {
  assert.deepEqual(C.resolve("G5", 7, false), {
    note: "G5",
    grip: "C5",
    valid: true,
    shifted: false,
  });
  assert.equal(C.resolve("C5", 7, false).valid, false);
  assert.deepEqual(C.resolve("C5", 7, true), {
    note: "C6",
    grip: "F5",
    valid: true,
    shifted: true,
  });
});
test("Alle Töne und Stimmungen liefern gültige Oktavanpassungen", () => {
  for (let n = 69; n <= 89; n++)
    for (let offset = -12; offset <= 12; offset++) {
      const r = C.resolve(C.name(n), offset, true);
      assert.ok(r.valid);
      assert.ok(lib.fingerings[r.grip]);
      assert.equal(C.midi(r.note) - C.midi(r.grip), offset);
      assert.ok((C.midi(r.note) - n) % 12 === 0);
    }
});
test("Editor liest Notenlängen, Pausen und Phrasen", () => {
  const s = C.parse("Intro: C5:0.5 R:2 | D5", lib.fingerings);
  assert.equal(s[0].events.length, 3);
  assert.equal(s[0].events[0].beats, 0.5);
  assert.equal(s[0].events[1].note, "R");
  for (const t of [
    "Intro: Z9",
    "Intro: C5:0",
    "Intro: C5:33",
    "Intro: C3",
    "Intro:",
  ])
    assert.throws(() => C.parse(t, lib.fingerings));
});
test("Stimmgerät erkennt synthetische Grundtöne und Stille", () => {
  assert.equal(C.pitch(new Float32Array(4096), 48000), null);
  for (const rate of [44100, 48000])
    for (const freq of [261.626, 440, 523.251, 783.991, 1046.502]) {
      const s = Float32Array.from(
        { length: 4096 },
        (_, i) =>
          0.25 * Math.sin((2 * Math.PI * freq * i) / rate) +
          0.025 * Math.sin((4 * Math.PI * freq * i) / rate),
      );
      const result = C.pitch(s, rate);
      assert.ok(
        result && Math.abs(1200 * Math.log2(result / freq)) < 5,
        `${freq} -> ${result}`,
      );
    }
});
test("Ausgelieferte Bibliothek enthält gültige Töne, Längen und IDs", () => {
  const ids = new Set();
  for (const s of lib.songs) {
    assert.ok(!ids.has(s.id));
    ids.add(s.id);
    assert.ok(s.sections.length);
    for (const sec of s.sections)
      for (const e of sec.events) {
        assert.ok(e.note === "R" || lib.fingerings[e.note], e.note);
        assert.ok(e.beats > 0 && e.beats <= 32, e.beats);
      }
  }
  assert.ok(lib.songs.some((s) => s.family === "Final Fantasy"));
  assert.ok(
    lib.songs.some((s) => s.title === "Saria's Song" && s.level === "advanced"),
  );
});
test("FFX-Erweiterung liefert 14 Melodien jeweils kurz und lang", () => {
  const songs = lib.songs.filter((s) => s.game === "Final Fantasy X");
  assert.equal(songs.length, 28);
  for (const title of new Set(songs.map((s) => s.title))) {
    const pair = songs.filter((s) => s.title === title);
    assert.equal(pair.length, 2);
    assert.ok(pair.some((s) => s.level === "beginner"));
    assert.ok(pair.some((s) => s.level === "advanced"));
    const short = pair
      .find((s) => s.level === "beginner")
      .sections.flatMap((s) => s.events);
    assert.ok(short.filter((e) => e.note !== "R").length <= 12);
    assert.equal(short.at(-1).note === "R", false);
  }
});
test("Bibliotheksupdate bewahrt Bearbeitungen, Löschungen und Favoriten", () => {
  const stored = structuredClone(lib);
  stored.songs = stored.songs.slice(1, 30);
  stored.songs[0].title = "Meine bearbeitete Fassung";
  stored.songs.push({ id: "custom-1", title: "Eigene Melodie" });
  delete stored.bundledIds;
  stored.settings = { offset: 7, favorites: ["original-1"] };
  const updated = C.updateLibrary(stored, lib);
  assert.equal(updated.added, 36);
  assert.equal(
    updated.library.songs.some((s) => s.id === "original-0"),
    false,
  );
  assert.equal(
    updated.library.songs.find((s) => s.id === "original-1").title,
    "Meine bearbeitete Fassung",
  );
  assert.ok(updated.library.songs.some((s) => s.id === "custom-1"));
  assert.deepEqual(updated.library.settings, stored.settings);
  assert.equal(C.updateLibrary(updated.library, lib).added, 0);
  const removed = updated.library.songs.find(
    (s) => s.game === "Final Fantasy X",
  ).id;
  updated.library.songs = updated.library.songs.filter((s) => s.id !== removed);
  assert.equal(
    C.updateLibrary(updated.library, lib).library.songs.some(
      (s) => s.id === removed,
    ),
    false,
  );
});
