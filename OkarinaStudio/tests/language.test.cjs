const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  I = require("../ui/i18n.js"),
  C = require("../ui/core.js");
test("UI translations preserve whitespace and German originals", () => {
  for (const value of ["Alle Melodien", "  Abspielen  ", "\n  "])
    assert.equal(I.text(value, "de"), value);
  assert.equal(I.text("  Alle Melodien  ", "en"), "  All melodies  ");
  assert.equal(I.text("1 Schlag", "en"), "1 beat");
  assert.equal(I.text("2 Schläge · Griff H5", "en"), "2 beats · Fingering H5");
  assert.equal(I.text("Abschnitt 4", "en"), "Section 4");
  assert.ok(
    I.text(
      "20 neue Fassungen ergänzt – deine Lieder und Einstellungen bleiben erhalten.",
      "en",
    ).startsWith("20 new arrangements"),
  );
});
test("Note names follow display language while MIDI pitches stay unchanged", () => {
  assert.equal(C.display("B5", "de"), "H5");
  assert.equal(C.display("B5", "en"), "B5");
  assert.equal(C.display("A#5", "en"), "A♯5");
  assert.equal(C.midi("B5"), 83);
});
