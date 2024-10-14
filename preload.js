const { contextBridge, ipcRenderer } = require("electron");

const contextBridgeApi = {
  getData: () => ipcRenderer.invoke("get-data"),
};

// console.log("hello, world!");

contextBridge.exposeInMainWorld("_electronApi", contextBridgeApi);
