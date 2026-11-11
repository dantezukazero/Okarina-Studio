const { _electron: electron } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "okarina-screenshots-"));
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ args: [".", "--user-data-dir=" + profile], env });
  try {
    const page = await app.firstWindow();
    await page.waitForSelector(".song-card");
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.locator("#language").selectOption("en");
    await page.waitForFunction(() => document.querySelector("#play").textContent === "▶ Play");
    await page.waitForFunction(() => document.querySelector("#saveState").textContent.includes("Saved"));
    const images = path.resolve("..", "docs", "screenshots");
    fs.mkdirSync(images, { recursive: true });
    await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector("#toast").style.display = "none"; });
    await page.screenshot({ path: path.join(images, "zelda-en.png"), animations: "disabled" });
    await page.locator("#startZelda").click();
    await page.evaluate(() => window.scrollTo(0, 520));
    await page.screenshot({ path: path.join(images, "zelda-practice-en.png"), animations: "disabled" });
    console.log("Captured English Zelda overview and practice screenshots.");
  } finally {
    await app.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
