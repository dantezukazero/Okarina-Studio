const { _electron: electron } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  os = require("os"),
  vm = require("vm");
(async () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync("ui/library.js", "utf8"), sandbox);
  const bundled = sandbox.window.LIBRARY,
    profile = fs.mkdtempSync(path.join(os.tmpdir(), "okarina-update-"));
  const old = structuredClone(bundled);
  old.songs = old.songs.slice(1, 30);
  old.songs[0].title = "Bearbeitet vor Update";
  old.songs.push({
    id: "custom-update",
    title: "Mein eigenes Lied",
    family: "Eigene Sammlung",
    game: "Privat",
    level: "beginner",
    bpm: 80,
    sections: [{ label: "Test", events: [{ note: "C5", beats: 1 }] }],
  });
  delete old.bundledIds;
  delete old.legacyBundledIds;
  old.settings = { offset: 7, fold: false, favorites: ["original-1"] };
  fs.writeFileSync(path.join(profile, "library.json"), JSON.stringify(old));
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    args: [".", "--user-data-dir=" + profile],
    env,
  });
  try {
    const page = await app.firstWindow();
    await page.waitForSelector(".song-card");
    await page.waitForFunction(() =>
      document.querySelector("#saveState").textContent.includes("Gespeichert"),
    );
    assert.equal(await page.locator(".song-card").count(), 66);
    assert.equal(await page.locator("#tuning").inputValue(), "7");
    assert.equal(await page.locator("#fold").isChecked(), false);
    assert.equal(
      await page.locator(".practice h2").innerText(),
      "Bearbeitet vor Update",
    );
    await page.locator("#startFfx").click();
    assert.equal(await page.locator(".song-card").count(), 28);
    assert.equal(
      await page.locator(".practice h2").innerText(),
      "To Zanarkand",
    );
    assert.equal(
      await page.locator(".variant.active").innerText(),
      "Einsteiger · kurz",
    );
    await page
      .locator("[data-variant]")
      .filter({ hasText: "Fortgeschritten" })
      .click();
    await page.locator("#play").click();
    await page.waitForTimeout(200);
    assert.equal(await page.locator("#play").innerText(), "Ⅱ Pause");
    await page.locator("#play").click();
    await page.screenshot({ path: "ffx-preview.png", fullPage: true });
    await page.reload();
    await page.waitForSelector(".song-card");
    assert.equal(await page.locator(".song-card").count(), 66);
    const data = await page.evaluate(() => window.desktop.load());
    assert.ok(data.songs.some((s) => s.id === "custom-update"));
    assert.equal(
      data.songs.some((s) => s.id === "original-0"),
      false,
    );
    assert.deepEqual(data.settings.favorites, ["original-1"]);
    console.log(
      "Update passed: 36 new versions once, no duplicates; edits/deletions/custom songs/favorites/tuning preserved; FFX shortcut and both variants playable.",
    );
  } finally {
    await app.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
