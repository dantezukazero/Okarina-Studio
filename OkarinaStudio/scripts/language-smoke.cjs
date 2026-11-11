const { _electron: electron } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  os = require("os");
(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "okarina-language-")),
    env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    args: [".", "--user-data-dir=" + profile],
    env,
  });
  try {
    const page = await app.firstWindow(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.waitForSelector(".song-card");
    await page.setViewportSize({ width: 1440, height: 1100 });
    const images = path.resolve("..", "docs", "screenshots");
    fs.mkdirSync(images, { recursive: true });
    await page.screenshot({
      path: path.join(images, "zelda-de.png"),
      animations: "disabled",
    });
    await page.locator("#startZelda").click();
    await page.evaluate(() => window.scrollTo(0, 520));
    await page.screenshot({
      path: path.join(images, "zelda-practice-de.png"),
      animations: "disabled",
    });
    await page.locator("#startKh").click();
    assert.equal(await page.locator(".song-card").count(), 20);
    assert.equal(
      await page.locator(".practice h2").innerText(),
      "Dearly Beloved",
    );
    await page
      .locator("[data-variant]")
      .filter({ hasText: "Fortgeschritten" })
      .click();
    await page.evaluate(() => {
      window.scrollTo(0, 520);
      document.querySelector("#toast").style.display = "none";
    });
    await page.screenshot({
      path: path.join(images, "kingdom-hearts-de.png"),
      animations: "disabled",
    });
    await page.locator("#language").selectOption("en");
    await page.waitForFunction(
      () =>
        document.documentElement.lang === "en" &&
        document.querySelector("#play").textContent === "▶ Play",
    );
    assert.equal(
      await page.locator("#gameFilter").inputValue(),
      "Kingdom Hearts",
    );
    assert.equal(
      await page.locator('[data-level="beginner"]').innerText(),
      "Beginner",
    );
    assert.ok(
      (await page.locator(".source").innerText()).includes("Single-voice"),
    );
    await page.evaluate(
      () => (document.querySelector("#toast").style.display = "none"),
    );
    await page.screenshot({
      path: path.join(images, "kingdom-hearts-en.png"),
      animations: "disabled",
    });
    const svgFile = path.join(profile, "english.svg");
    await app.evaluate(({ dialog }, file) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    }, svgFile);
    await page.locator("#svg").click();
    await page.waitForFunction(
      () => document.querySelector("#toast").textContent === "SVG saved.",
    );
    const svg = fs.readFileSync(svgFile, "utf8");
    assert.ok(svg.includes("Section 1"));
    assert.ok(svg.includes("Thumbs"));
    assert.ok(!svg.includes("Daumen"));
    assert.ok(!svg.includes("Abschnitt"));
    await page.locator("#help").click();
    assert.ok(
      (await page.locator("#helpDialog").innerText()).includes(
        "What key is my ocarina in?",
      ),
    );
    assert.ok(
      (await page.locator("#helpDialog").innerText()).includes(
        "by Joce’s Designs.",
      ),
    );
    assert.equal(
      await page.locator("#micStart").innerText(),
      "Start microphone",
    );
    await page.locator("#closeHelp").click();
    await page.locator("#new").click();
    assert.equal(
      await page
        .locator("#editFamily option")
        .filter({ hasText: "Kingdom Hearts" })
        .getAttribute("value"),
      "Kingdom Hearts",
    );
    await page.locator("#editTitle").fill("Deine Melodien");
    await page.locator("#editFamily").selectOption("Kingdom Hearts");
    await page.locator("#editNotes").fill("Test: X9");
    await page.getByRole("button", { name: "Save song", exact: true }).click();
    assert.ok(
      (await page.locator("#editError").innerText()).includes("Invalid input"),
    );
    await page.locator("#editNotes").fill("Test: B5 R:1 C6");
    await page.getByRole("button", { name: "Save song", exact: true }).click();
    assert.equal(
      await page.locator(".practice h2").innerText(),
      "Deine Melodien",
    );
    assert.equal(await page.locator(".note strong").first().innerText(), "B5");
    await page.waitForFunction(() =>
      document.querySelector("#saveState").textContent.includes("Saved"),
    );
    await page.reload();
    await page.waitForSelector(".song-card");
    assert.equal(await page.locator("#language").inputValue(), "en");
    assert.equal(await page.locator("#play").innerText(), "▶ Play");
    await page
      .locator("[data-song]")
      .filter({ hasText: "Deine Melodien" })
      .click();
    await page.locator("#language").selectOption("de");
    await page.waitForFunction(
      () => document.querySelector("#play").textContent === "▶ Abspielen",
    );
    assert.equal(
      await page.locator(".practice h2").innerText(),
      "Deine Melodien",
    );
    assert.equal(await page.locator(".note strong").first().innerText(), "H5");
    assert.deepEqual(errors, []);
    console.log(
      "Language passed: DE/EN UI, help, validation, canonical select values, unchanged user title, B/H notation, persistence and screenshots.",
    );
  } finally {
    await app.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
