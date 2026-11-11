const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const Catalog = require("./ui/catalog.js");
const BASE =
  "https://raw.githubusercontent.com/dantezukazero/Okarina-Studio/main/library/";
const MAX_BYTES = 4 * 1024 * 1024;
function compatible(actual, minimum) {
  const a = actual.split(".").map(Number),
    b = minimum.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return true;
}
function validateManifest(m) {
  if (
    !m ||
    m.schemaVersion !== 1 ||
    !Number.isSafeInteger(m.revision) ||
    m.revision < 1 ||
    !/^catalog-[A-Za-z0-9._-]+\.json$/.test(m.file || "") ||
    !/^[a-f0-9]{64}$/.test(m.sha256 || "") ||
    !Number.isSafeInteger(m.bytes) ||
    m.bytes < 1 ||
    m.bytes > MAX_BYTES ||
    !/^\d+\.\d+\.\d+$/.test(m.minAppVersion || "")
  )
    throw Error("Invalid library update manifest");
  return m;
}
function hash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
function createUpdater({
  cacheFile,
  appVersion,
  fingerings,
  fetchImpl = globalThis.fetch,
}) {
  let pending;
  async function download(file, limit) {
    const response = await fetchImpl(BASE + file, {
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/json" },
    });
    if (!response.ok)
      throw Error("Library server returned HTTP " + response.status);
    const chunks = [];
    let size = 0;
    try {
      for await (const chunk of response.body) {
        size += chunk.byteLength;
        if (size > limit) throw Error("Library download exceeds size limit");
        chunks.push(Buffer.from(chunk));
      }
    } catch (e) {
      throw e;
    }
    return Buffer.concat(chunks);
  }
  function verify(manifest, body) {
    validateManifest(manifest);
    const bytes = Buffer.from(body, "utf8");
    if (bytes.length !== manifest.bytes || hash(bytes) !== manifest.sha256)
      throw Error("Library checksum mismatch");
    const catalog = Catalog.validate(JSON.parse(body), fingerings);
    if (
      catalog.revision !== manifest.revision ||
      catalog.minAppVersion !== manifest.minAppVersion
    )
      throw Error("Library manifest and payload disagree");
    return catalog;
  }
  async function readCache() {
    try {
      const stat = await fs.stat(cacheFile);
      if (stat.size > MAX_BYTES * 2 + 65536)
        throw Error("Invalid library cache");
      const saved = JSON.parse(await fs.readFile(cacheFile, "utf8"));
      if (!compatible(appVersion, saved.manifest?.minAppVersion || "999.0.0"))
        return null;
      return verify(saved.manifest, saved.body);
    } catch (e) {
      if (e.code === "ENOENT") return null;
      return null;
    }
  }
  async function check(currentRevision = 0) {
    if (pending) return pending;
    pending = (async () => {
      const cached = await readCache();
      let manifest;
      try {
        manifest = validateManifest(
          JSON.parse((await download("manifest.json", 16384)).toString("utf8")),
        );
      } catch (e) {
        return { status: "error", message: e.message, catalog: cached };
      }
      if (!compatible(appVersion, manifest.minAppVersion))
        return {
          status: "requires-app",
          minAppVersion: manifest.minAppVersion,
        };
      if (
        manifest.revision <=
        Math.max(
          Number.isSafeInteger(currentRevision) ? currentRevision : 0,
          cached?.revision || 0,
        )
      )
        return { status: "current", catalog: cached };
      try {
        const bytes = await download(manifest.file, MAX_BYTES),
          body = bytes.toString("utf8"),
          catalog = verify(manifest, body);
        await fs.mkdir(path.dirname(cacheFile), { recursive: true });
        await fs.writeFile(
          cacheFile + ".tmp",
          JSON.stringify({ manifest, body }),
          "utf8",
        );
        await fs.rename(cacheFile + ".tmp", cacheFile);
        return { status: "downloaded", catalog };
      } catch (e) {
        return { status: "error", message: e.message, catalog: cached };
      }
    })();
    try {
      return await pending;
    } finally {
      pending = null;
    }
  }
  return { check, readCache };
}
module.exports = {
  createUpdater,
  validateManifest,
  compatible,
  BASE,
  MAX_BYTES,
};
