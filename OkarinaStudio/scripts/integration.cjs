const { _electron: electron } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  os = require("os");
(async () => {
  const profile = fs.mkdtempSync(
      path.join(os.tmpdir(), "okarina-integration-"),
    ),
    env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    args: [".", "--user-data-dir=" + profile],
    env,
  });
  try {
    const page = await app.firstWindow();
    await page.waitForSelector(".song-card");
    await page.locator("#help").click();
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        window.fakeMicContext = new AudioContext();
        const osc = window.fakeMicContext.createOscillator(),
          dest = window.fakeMicContext.createMediaStreamDestination();
        osc.frequency.value = 783.991;
        osc.connect(dest);
        osc.start();
        await window.fakeMicContext.resume();
        return dest.stream;
      };
    });
    await page.locator("#micStart").click();
    await page.waitForFunction(
      () => !document.querySelector("#usePitch").disabled,
    );
    assert.ok(
      (await page.locator("#tunerReadout").innerText()).startsWith("G5"),
    );
    await page.locator("#usePitch").click();
    assert.equal(await page.locator("#tuning").inputValue(), "7");
    await page.locator("#closeHelp").click();
    await page.waitForFunction(() =>
      document.querySelector("#saveState").textContent.includes("Gespeichert"),
    );
    await page.reload();
    await page.waitForSelector(".song-card");
    assert.equal(await page.locator("#tuning").inputValue(), "7");
    const importFile = path.join(profile, "import.json");
    fs.writeFileSync(
      importFile,
      JSON.stringify({
        format: "ocarina-tabs-v1",
        fingerings: await page.evaluate(() => window.LIBRARY.fingerings),
        songs: [
          {
            title: "Import-Test",
            game: "Eigene Sammlung",
            sections: [{ label: "Test", notes: "C5 D5 | E5" }],
          },
        ],
      }),
    );
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [file],
      });
    }, importFile);
    await page.locator("#import").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".practice h2").textContent === "Import-Test",
    );
    assert.equal(await page.locator(".song-card").count(), 67);
    const backupFile = path.join(profile, "backup.json");
    await app.evaluate(({ dialog }, file) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    }, backupFile);
    await page.locator("#backup").click();
    await page.waitForFunction(
      () =>
        document.querySelector("#toast").textContent ===
        "Bibliothek gesichert.",
    );
    assert.equal(
      JSON.parse(fs.readFileSync(backupFile, "utf8")).songs.length,
      67,
    );
    const pdfFile = path.join(profile, "sheet.pdf");
    await app.evaluate(({ dialog }, file) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    }, pdfFile);
    await page.locator("#pdf").click();
    await page.waitForFunction(
      () => document.querySelector("#toast").textContent === "PDF gespeichert.",
    );
    assert.equal(fs.readFileSync(pdfFile).subarray(0, 4).toString(), "%PDF");
    await page.emulateMedia({ media: "print" });
    await page.screenshot({ path: "print-preview.png", fullPage: true });
    console.log(
      "Integration passed: synthetic microphone G5, apply and persist tuning, legacy JSON import, JSON export, PDF export.",
    );
  } finally {
    await app.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
