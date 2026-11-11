const { _electron: electron } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("fs");
(async () => {
  const profile = fs.mkdtempSync(
    require("path").join(require("os").tmpdir(), "okarina-test-"),
  );
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    args: [".", "--user-data-dir=" + profile],
    env,
  });
  const page = await app.firstWindow();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.waitForSelector(".song-card");
  assert.equal(await page.locator(".song-card").count(), 86);
  await page.screenshot({ path: "preview.png", fullPage: true });
  await page.getByRole("button", { name: "▶ Abspielen", exact: true }).click();
  await page.waitForTimeout(900);
  assert.equal(await page.locator("#play").innerText(), "Ⅱ Pause");
  await page.locator("#play").click();
  await page.locator('[data-family="Final Fantasy"]').click();
  assert.equal(await page.locator(".song-card").count(), 48);
  await page.locator('[data-level="advanced"]').click();
  assert.equal(await page.locator(".song-card").count(), 24);
  await page.locator(".song-card").first().click();
  await page.locator("#tuning").selectOption("7");
  assert.ok(
    (await page.locator(".note small").first().innerText()).includes("Griff"),
  );
  await page.locator("#help").click();
  assert.ok(await page.locator("#tunerBox").isVisible());
  await page.locator("#manualTuning").selectOption("0");
  await page.locator("#applyTuning").click();
  await page.locator("#closeHelp").click();
  await page.locator("#new").click();
  await page.locator("#editTitle").fill("Smoke-Test Lied");
  await page.locator("#editNotes").fill("Test: C5:0.5 R:1 G5:2");
  await page
    .getByRole("button", { name: "Lied speichern", exact: true })
    .click();
  assert.equal(
    await page.locator(".practice h2").innerText(),
    "Smoke-Test Lied",
  );
  await page.waitForTimeout(300);
  const stored = await page.evaluate(() => window.desktop.load());
  assert.ok(stored.songs.some((s) => s.title === "Smoke-Test Lied"));
  await page.locator("#edit").click();
  await page.locator("#editNotes").fill("Test: X9");
  await page
    .getByRole("button", { name: "Lied speichern", exact: true })
    .click();
  assert.ok(
    (await page.locator("#editError").innerText()).includes("Ungültig"),
  );
  await page.locator("#closeEditor").click();
  assert.deepEqual(errors, []);
  console.log(
    "UI smoke passed: library, filters, audio, transposition, tuner help, editor, persistence, invalid input.",
  );
  await app.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
