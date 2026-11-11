const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const Catalog = require("../ui/catalog.js");
const project = path.resolve(__dirname, ".."),
  root = path.resolve(project, "..", "library");
const bundleFile = path.join(project, "ui/library.js");
const bundled = JSON.parse(
  fs
    .readFileSync(bundleFile, "utf8")
    .replace(/^window\.LIBRARY\s*=\s*/, "")
    .replace(/;\s*$/, ""),
);
fs.mkdirSync(root, { recursive: true });
const source = path.join(root, "catalog.json");
if (process.argv.includes("--init") && !fs.existsSync(source))
  fs.writeFileSync(
    source,
    JSON.stringify(
      {
        format: "okarina-catalog-v1",
        schemaVersion: 1,
        revision: 1,
        minAppVersion: "1.3.0",
        fingerings: bundled.fingerings,
        songs: bundled.songs,
      },
      null,
      2,
    ) + "\n",
  );
const raw = fs.readFileSync(source),
  catalog = Catalog.validate(
    JSON.parse(raw.toString("utf8")),
    bundled.fingerings,
  );
const sha256 = crypto.createHash("sha256").update(raw).digest("hex");
let previous;
try {
  previous = JSON.parse(
    fs.readFileSync(path.join(root, "manifest.json"), "utf8"),
  );
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
if (previous && catalog.revision < previous.revision)
  throw Error("Catalog revision must not decrease.");
if (
  previous &&
  previous.sha256 !== sha256 &&
  catalog.revision <= previous.revision
)
  throw Error("Increase catalog.json revision before publishing changed data.");
const file =
  "catalog-r" + catalog.revision + "-" + sha256.slice(0, 12) + ".json";
fs.writeFileSync(path.join(root, file), raw);
fs.writeFileSync(
  path.join(root, "manifest.json"),
  JSON.stringify(
    {
      schemaVersion: 1,
      revision: catalog.revision,
      minAppVersion: catalog.minAppVersion,
      file,
      sha256,
      bytes: raw.length,
    },
    null,
    2,
  ) + "\n",
);
if (process.argv.includes("--bundle"))
  fs.writeFileSync(
    bundleFile,
    "window.LIBRARY = " +
      JSON.stringify({
        format: "okarina-studio-v1",
        fingerings: catalog.fingerings,
        songs: catalog.songs,
        bundledIds: catalog.songs.map((s) => s.id),
        legacyBundledIds:
          bundled.legacyBundledIds ||
          bundled.songs.slice(0, 30).map((s) => s.id),
        catalogRevision: catalog.revision,
      }) +
      ";\n",
  );
console.log(
  "Catalog revision " +
    catalog.revision +
    ": " +
    catalog.songs.length +
    " arrangements, " +
    raw.length +
    " bytes. Commit and push library/ to publish.",
);
