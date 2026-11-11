const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  { execFileSync } = require("node:child_process"),
  crypto = require("node:crypto");
test("export/import/publish workflow increments revision and rejects unversioned edits", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "okarina-publish-")),
    project = path.join(dir, "OkarinaStudio");
  for (const folder of ["scripts", "ui"])
    fs.mkdirSync(path.join(project, folder), { recursive: true });
  fs.mkdirSync(path.join(dir, "library"));
  for (const file of [
    "scripts/catalog-import.cjs",
    "scripts/catalog-publish.cjs",
    "ui/catalog.js",
    "ui/core.js",
    "ui/library.js",
  ])
    fs.copyFileSync(file, path.join(project, file));
  for (const file of ["catalog.json", "manifest.json"])
    fs.copyFileSync("../library/" + file, path.join(dir, "library", file));
  const catalog = JSON.parse(
      fs.readFileSync("../library/catalog.json", "utf8"),
    ),
    song = {
      ...structuredClone(catalog.songs[0]),
      id: "published-cli-test",
      title: "My new melody",
    },
    correction = {
      ...structuredClone(catalog.songs[1]),
      title: "Corrected name",
    },
    input = path.join(dir, "export.json");
  fs.writeFileSync(
    input,
    JSON.stringify({
      format: "okarina-studio-v1",
      fingerings: catalog.fingerings,
      songs: [song, correction],
    }),
  );
  execFileSync(process.execPath, ["scripts/catalog-import.cjs", input], {
    cwd: project,
  });
  execFileSync(process.execPath, ["scripts/catalog-publish.cjs"], {
    cwd: project,
  });
  const manifest = JSON.parse(
      fs.readFileSync(path.join(dir, "library/manifest.json"), "utf8"),
    ),
    bytes = fs.readFileSync(path.join(dir, "library", manifest.file));
  assert.equal(manifest.revision, 2);
  assert.equal(
    manifest.sha256,
    crypto.createHash("sha256").update(bytes).digest("hex"),
  );
  assert.equal(JSON.parse(bytes).songs.length, 87);
  const file = path.join(dir, "library/catalog.json"),
    edited = JSON.parse(fs.readFileSync(file, "utf8"));
  edited.songs[0].title = "Unversioned change";
  fs.writeFileSync(file, JSON.stringify(edited));
  assert.throws(() =>
    execFileSync(process.execPath, ["scripts/catalog-publish.cjs"], {
      cwd: project,
      stdio: "pipe",
    }),
  );
});
