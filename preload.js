const { contextBridge, ipcRenderer } = require("electron");

const contextBridgeApi = {
  getData: () => ipcRenderer.invoke("get-data"),
  // getFocusIcons: () => ipcRenderer.invoke("get-focus-icons"),
};

// console.log("hello, world!");

contextBridge.exposeInMainWorld("_electronApi", contextBridgeApi);
