const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createUpdater } = require("./catalog-updater.cjs");
let win;
let catalogUpdater;
app.whenReady().then(() => {
  const bundle = JSON.parse(
    require("node:fs")
      .readFileSync(path.join(__dirname, "ui/library.js"), "utf8")
      .replace(/^window\.LIBRARY\s*=\s*/, "")
      .replace(/;\s*$/, ""),
  );
  catalogUpdater = createUpdater({
    cacheFile: path.join(app.getPath("userData"), "catalog-cache.json"),
    appVersion: app.getVersion(),
    fingerings: bundle.fingerings,
  });
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: "#101e1c",
    title: "Okarina Studio",
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (e, url) => {
    if (url !== win.webContents.getURL()) e.preventDefault();
  });
  win.loadFile("ui/index.html");
});
app.on("window-all-closed", () => app.quit());
const storage = () => path.join(app.getPath("userData"), "library.json");
ipcMain.handle("catalog-cache", () => catalogUpdater.readCache());
ipcMain.handle("catalog-check", (_, revision) =>
  catalogUpdater.check(revision),
);
ipcMain.handle("catalog-backup", async () => {
  try {
    await fs.copyFile(
      storage(),
      path.join(app.getPath("userData"), "library.before-catalog-update.json"),
    );
    return true;
  } catch (e) {
    if (e.code === "ENOENT") return true;
    throw e;
  }
});
ipcMain.handle("load", async () => {
  try {
    return JSON.parse(await fs.readFile(storage(), "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
});
ipcMain.handle("save", async (_, data) => {
  const file = storage();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file + ".tmp", JSON.stringify(data, null, 2), "utf8");
  await fs.rename(file + ".tmp", file);
  return true;
});
ipcMain.handle("export", async (_, data) => {
  const r = await dialog.showSaveDialog(win, {
    defaultPath: "Okarina-Bibliothek.json",
    filters: [{ name: "Okarina JSON", extensions: ["json"] }],
  });
  if (r.canceled) return false;
  await fs.writeFile(r.filePath, JSON.stringify(data, null, 2), "utf8");
  return true;
});
ipcMain.handle("import", async () => {
  const r = await dialog.showOpenDialog(win, {
    filters: [{ name: "Okarina JSON", extensions: ["json"] }],
  });
  if (r.canceled) return null;
  return JSON.parse(await fs.readFile(r.filePaths[0], "utf8"));
});
ipcMain.handle("pdf", async () => {
  const r = await dialog.showSaveDialog(win, {
    defaultPath: "Okarina-Griffbilder.pdf",
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (r.canceled) return false;
  const pdf = await win.webContents.printToPDF({
    printBackground: true,
    pageSize: "A4",
    preferCSSPageSize: true,
  });
  await fs.writeFile(r.filePath, pdf);
  return true;
});
ipcMain.handle("svg", async (_, svg) => {
  if (
    typeof svg !== "string" ||
    !svg.startsWith("<svg ") ||
    svg.length > 20000000
  )
    throw Error("Ungültiges SVG");
  const r = await dialog.showSaveDialog(win, {
    defaultPath: "Okarina-Griffbilder.svg",
    filters: [{ name: "SVG", extensions: ["svg"] }],
  });
  if (r.canceled) return false;
  await fs.writeFile(r.filePath, svg, "utf8");
  return true;
});
