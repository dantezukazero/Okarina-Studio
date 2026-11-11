const path = require("node:path"),
  fs = require("node:fs"),
  os = require("node:os");
const { createUpdater } = require("../catalog-updater.cjs");
const payload = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../library/catalog.json"),
    "utf8",
  ),
);
const updater = createUpdater({
  cacheFile: path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "okarina-live-catalog-")),
    "cache.json",
  ),
  appVersion: require("../package.json").version,
  fingerings: payload.fingerings,
});
(async () => {
  const result = await updater.check(0);
  if (result.status !== "downloaded") throw Error(JSON.stringify(result));
  const cache = await updater.readCache();
  if (!cache || cache.revision !== result.catalog.revision)
    throw Error("Offline cache validation failed");
  console.log(
    "Live GitHub catalog verified: revision " +
      cache.revision +
      ", " +
      cache.songs.length +
      " arrangements; checksum and offline cache valid.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
