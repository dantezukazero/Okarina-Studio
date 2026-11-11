const { _electron: electron } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os");
(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "okarina-catalog-ui-")),
    env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    args: [".", "--user-data-dir=" + profile],
    env,
  });
  try {
    const page = await app.firstWindow();
    await page.waitForSelector(".song-card");
    assert.equal(await page.locator("#autoCatalog").isChecked(), false);
    await page.locator("#language").selectOption("en");
    await page.waitForFunction(() =>
      document.querySelector("#saveState").textContent.includes("Saved"),
    );
    const remote = JSON.parse(
      fs.readFileSync("../library/catalog.json", "utf8"),
    );
    remote.revision = 2;
    remote.songs[0].title = "Updated official title";
    remote.songs.push({
      ...structuredClone(remote.songs[1]),
      id: "catalog-ui-new",
      title: "Downloaded melody",
    });
    await app.evaluate(({ ipcMain }, remote) => {
      ipcMain.removeHandler("catalog-check");
      ipcMain.handle("catalog-check", () => ({
        status: "downloaded",
        catalog: remote,
      }));
    }, remote);
    await page.locator("#libraryUpdate").click();
    await page.waitForFunction(() =>
      document.querySelector("#catalogStatus").textContent.includes("1 added"),
    );
    assert.equal(await page.locator(".song-card").count(), 87);
    assert.ok(
      fs.existsSync(path.join(profile, "library.before-catalog-update.json")),
    );
    await page.locator("#autoCatalog").check();
    await page.waitForFunction(() =>
      document.querySelector("#saveState").textContent.includes("Saved"),
    );
    await page.reload();
    await page.waitForSelector(".song-card");
    assert.equal(await page.locator(".song-card").count(), 87);
    assert.equal(await page.locator("#autoCatalog").isChecked(), true);
    await page.waitForFunction(
      () => !document.querySelector("#libraryUpdate").disabled,
    );
    await app.evaluate(({ ipcMain }) => {
      ipcMain.removeHandler("catalog-check");
      ipcMain.handle("catalog-check", () => ({
        status: "error",
        message: "offline",
      }));
    });
    await page.locator("#libraryUpdate").click();
    await page.waitForFunction(() =>
      document
        .querySelector("#catalogStatus")
        .textContent.includes("offline library"),
    );
    assert.equal(await page.locator(".song-card").count(), 87);
    console.log(
      "Catalog UI passed: manual update, corrections, one new melody, backup, saved auto preference and offline fallback.",
    );
  } finally {
    await app.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
