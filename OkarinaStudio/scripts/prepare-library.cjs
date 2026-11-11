// Optional: regenerate the checked-in note data from the documented sources.
// Normal development/builds use ui/library.js and do not download these archives.
const fs = require("node:fs/promises"),
  path = require("node:path"),
  crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
async function download(url, file) {
  const response = await fetch(url);
  if (!response.ok)
    throw Error("Download fehlgeschlagen: " + response.status + " " + url);
  await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
}
(async () => {
  const root = path.resolve(__dirname, "..");
  process.chdir(root);
  const generator = await fs.readFile("scripts/library.cjs", "utf8");
  const files = [...generator.matchAll(/\[\s*(['"])(.+?\.mid)\1,\s*\d+/g)].map(
    (m) => m[2],
  );
  await fs.mkdir("midis", { recursive: true });
  const archive = "Music.zip";
  try {
    await fs.access(archive);
  } catch {
    await download(
      "https://raw.githubusercontent.com/ryanrudes/game-midis/84a166099c32d6db101c8bd2f0eccc82c8402ddb/Music.zip",
      archive,
    );
  }
  const hash = crypto
    .createHash("sha256")
    .update(await fs.readFile(archive))
    .digest("hex");
  const expected = (await fs.readFile("scripts/archive.sha256", "utf8")).trim();
  if (hash !== expected)
    throw Error(
      "Music.zip stimmt nicht mit dem dokumentierten Archiv überein.",
    );
  const list = path.resolve("source-list.json");
  await fs.writeFile(
    list,
    JSON.stringify(
      files.filter(
        (f) => !f.startsWith("OOT__") && !f.includes("Besaid_Island"),
      ),
    ),
  );
  try {
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        path.resolve("scripts/extract-sources.ps1"),
        "-ArchivePath",
        path.resolve(archive),
        "-DestinationPath",
        path.resolve("midis"),
        "-ListPath",
        list,
      ],
      { stdio: "inherit" },
    );
  } finally {
    await fs.unlink(list);
  }
  for (const file of files.filter(
    (f) => f.startsWith("OOT__") || f.includes("Besaid_Island"),
  )) {
    try {
      await fs.access(path.join("midis", file));
    } catch {
      const url = file.startsWith("OOT__")
        ? "https://www.classiczelda.com/music/midi/zelda5/" + file.slice(5)
        : "https://www.hellandheavennet.com/final-fantasy-10/midis/Besaid_Island.mid";
      await download(url, path.join("midis", file));
    }
  }
  execFileSync(process.execPath, ["scripts/library.cjs"], { stdio: "inherit" });
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
