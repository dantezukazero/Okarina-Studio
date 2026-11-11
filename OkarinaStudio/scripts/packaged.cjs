const { _electron: electron } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  os = require("os");
(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "okarina-packed-")),
    env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    executablePath: path.resolve("dist/win-unpacked/Okarina Studio.exe"),
    args: ["--user-data-dir=" + profile],
    env,
  });
  try {
    const page = await app.firstWindow();
    await page.waitForSelector(".song-card");
    assert.equal(await page.locator(".song-card").count(), 66);
    const file = path.join(profile, "song.svg");
    await app.evaluate(({ dialog }, file) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    }, file);
    await page.locator("#svg").click();
    await page.waitForFunction(
      () => document.querySelector("#toast").textContent === "SVG gespeichert.",
    );
    assert.ok(fs.readFileSync(file, "utf8").startsWith("<svg "));
    const valid = await page.evaluate(
      (svg) =>
        new DOMParser()
          .parseFromString(svg, "image/svg+xml")
          .querySelector("parsererror") === null,
      fs.readFileSync(file, "utf8"),
    );
    assert.ok(valid);
    await page.setViewportSize({ width: 1000, height: 750 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    console.log(
      "Packaged app passed: startup with 66 versions, SVG export, no horizontal overflow at 1000px.",
    );
    console.log(
      "User data path: " +
        (await app.evaluate(({ app }) => app.getPath("userData"))),
    );
  } finally {
    await app.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
