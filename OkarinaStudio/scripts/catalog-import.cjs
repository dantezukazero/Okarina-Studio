const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const Catalog = require("../ui/catalog.js"),
  Core = require("../ui/core.js");
const file = process.argv[2];
if (!file) throw Error("Usage: npm run library:import -- path/to/export.json");
if (fs.statSync(file).size > 4 * 1024 * 1024)
  throw Error("Export exceeds 4 MiB.");
const incoming = JSON.parse(
  fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""),
);
if (
  !["okarina-studio-v1", "ocarina-tabs-v1"].includes(incoming.format) ||
  !Array.isArray(incoming.songs) ||
  !incoming.songs.length
)
  throw Error("Invalid exported library.");
const source = path.resolve(__dirname, "..", "..", "library/catalog.json"),
  original = Catalog.validate(JSON.parse(fs.readFileSync(source, "utf8")));
const edited = structuredClone(original);
let added = 0,
  updated = 0;
Catalog.validate(
  { ...original, fingerings: incoming.fingerings || original.fingerings },
  original.fingerings,
);
for (const input of incoming.songs) {
  const s = { ...input };
  s.family ||= "Eigene Sammlung";
  s.level = ["beginner", "advanced"].includes(s.level)
    ? s.level
    : s.level === "Mittel"
      ? "advanced"
      : "beginner";
  s.bpm = Math.min(240, Math.max(30, Number(s.bpm) || 85));
  s.id ||=
    "import-" +
    crypto
      .createHash("sha256")
      .update(s.family + "|" + s.game + "|" + s.title + "|" + s.level)
      .digest("hex")
      .slice(0, 24);
  if (incoming.format === "ocarina-tabs-v1")
    s.sections = s.sections.map(
      (sec) =>
        Core.parse(
          (sec.label || "Melodie") + ": " + sec.notes,
          original.fingerings,
        )[0],
    );
  const normalized = Catalog.normalizeSong(s, original.fingerings),
    index = edited.songs.findIndex((x) => x.id === s.id);
  if (index < 0) {
    edited.songs.push(normalized);
    added++;
  } else if (
    Catalog.fingerprint(edited.songs[index], original.fingerings) !==
    Catalog.fingerprint(normalized, original.fingerings)
  ) {
    edited.songs[index] = normalized;
    updated++;
  }
}
if (!added && !updated) {
  console.log("No changes to publish.");
  process.exit(0);
}
edited.revision++;
Catalog.validate(edited, original.fingerings);
fs.writeFileSync(source, JSON.stringify(edited, null, 2) + "\n");
console.log(
  added +
    " added, " +
    updated +
    " updated. Revision " +
    edited.revision +
    ". Run npm run library:publish, then commit and push library/.",
);
