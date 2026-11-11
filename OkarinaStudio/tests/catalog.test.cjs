const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  fsp = require("node:fs/promises"),
  path = require("node:path"),
  os = require("node:os"),
  crypto = require("node:crypto");
const C = require("../ui/catalog.js"),
  { createUpdater, BASE } = require("../catalog-updater.cjs");
const payload = JSON.parse(fs.readFileSync("../library/catalog.json", "utf8"));
const bundled = {
  songs: payload.songs,
  fingerings: payload.fingerings,
  bundledIds: payload.songs.map((s) => s.id),
  catalogRevision: 1,
};
function revision2() {
  const p = structuredClone(payload);
  p.revision = 2;
  p.songs[0].title = "Corrected title";
  p.songs.push({
    ...structuredClone(p.songs[1]),
    id: "new-update-test",
    title: "New melody",
  });
  return p;
}
function manifest(p) {
  const bytes = Buffer.from(JSON.stringify(p));
  return {
    schemaVersion: 1,
    revision: p.revision,
    minAppVersion: p.minAppVersion,
    file: "catalog-r" + p.revision + ".json",
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  };
}
test("catalog merge corrects untouched songs, adds new songs, preserves edits and deletions", () => {
  const live = C.initialize(
    { ...bundled, songs: structuredClone(payload.songs) },
    bundled,
  );
  live.songs[1].title = "My personal edit";
  const deleted = live.songs[2].id;
  live.songs.splice(2, 1);
  const remote = revision2();
  remote.songs[1].title = "Official correction";
  const result = C.merge(live, remote, bundled);
  assert.equal(result.added, 1);
  assert.equal(result.updated, 1);
  assert.equal(result.preserved, 1);
  assert.equal(result.library.songs[0].title, "Corrected title");
  assert.equal(result.library.songs[1].title, "My personal edit");
  assert.ok(!result.library.songs.some((s) => s.id === deleted));
  assert.equal(C.merge(result.library, remote, bundled).changed, false);
  const older = C.merge(result.library, payload, bundled);
  assert.equal(older.changed, false);
  assert.equal(older.library.catalogRevision, 2);
});
test("invalid catalogs and mismatched fingering charts are rejected", () => {
  for (const change of [
    (p) => (p.schemaVersion = 9),
    (p) => (p.songs[0].sections[0].events[0].note = "Z9"),
    (p) => p.songs.push(p.songs[0]),
    (p) => (p.fingerings.C5 = []),
    (p) => (p.songs[0].id = "__proto__"),
  ]) {
    const p = structuredClone(payload);
    change(p);
    assert.throws(() => C.validate(p, payload.fingerings));
  }
});
test("updater verifies fixed HTTPS endpoint and checksum, caches valid data and survives offline", async () => {
  const cacheFile = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "okarina-catalog-")),
      "cache.json",
    ),
    remote = revision2(),
    m = manifest(remote),
    calls = [];
  let offline = false,
    bad = false;
  const updater = createUpdater({
    cacheFile,
    appVersion: "1.3.0",
    fingerings: payload.fingerings,
    fetchImpl: async (url, options) => {
      calls.push(url);
      assert.ok(url.startsWith(BASE));
      assert.equal(options.redirect, "error");
      if (offline) throw Error("offline");
      return new Response(
        JSON.stringify(
          url.endsWith("manifest.json")
            ? m
            : bad
              ? { ...remote, revision: 3 }
              : remote,
        ),
      );
    },
  });
  assert.equal(await updater.readCache(), null);
  assert.equal((await updater.check(1)).status, "downloaded");
  assert.equal((await updater.readCache()).revision, 2);
  assert.equal(calls.length, 2);
  assert.equal((await updater.check(2)).status, "current");
  assert.equal(calls.length, 3);
  offline = true;
  const fallback = await updater.check(2);
  assert.equal(fallback.status, "error");
  assert.equal(fallback.catalog.revision, 2);
  offline = false;
  bad = true;
  m.revision = 3;
  const rejected = await updater.check(2);
  assert.equal(rejected.status, "error");
  assert.equal((await updater.readCache()).revision, 2);
  const saved = JSON.parse(await fsp.readFile(cacheFile, "utf8"));
  saved.body += " ";
  await fsp.writeFile(cacheFile, JSON.stringify(saved));
  assert.equal(await updater.readCache(), null);
});
test("updater refuses incompatible app versions, path traversal and oversized manifest responses", async () => {
  for (const mode of ["version", "path", "size"]) {
    const m = manifest(payload);
    if (mode === "version") m.minAppVersion = "99.0.0";
    if (mode === "path") m.file = "../evil.json";
    const updater = createUpdater({
      cacheFile: path.join(os.tmpdir(), "absent-catalog-test.json"),
      appVersion: "1.3.0",
      fingerings: payload.fingerings,
      fetchImpl: async () =>
        new Response(mode === "size" ? "x".repeat(17000) : JSON.stringify(m)),
    });
    const result = await updater.check(0);
    assert.equal(result.status, mode === "version" ? "requires-app" : "error");
  }
});
