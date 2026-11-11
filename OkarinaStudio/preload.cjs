const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktop", {
  load: () => ipcRenderer.invoke("load"),
  save: (d) => ipcRenderer.invoke("save", d),
  export: (d) => ipcRenderer.invoke("export", d),
  import: () => ipcRenderer.invoke("import"),
  pdf: () => ipcRenderer.invoke("pdf"),
  svg: (s) => ipcRenderer.invoke("svg", s),
});
