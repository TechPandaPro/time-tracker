const { contextBridge, ipcRenderer } = require("electron");

const contextBridgeApi = {
  getData: () => ipcRenderer.invoke("get-data"),
  updateFocusIcon: (focusId, newIcon) =>
    ipcRenderer.invoke("update-focus-icon", focusId, newIcon),
  updateFocusName: (focusId, newName) =>
    ipcRenderer.invoke("update-focus-name", focusId, newName),
  updateFocusGoal: (focusId, newGoalMs) =>
    ipcRenderer.invoke("update-focus-goal", focusId, newGoalMs),
  setFocus: (focusId) => ipcRenderer.invoke("set-focus", focusId),
  createFocus: () => ipcRenderer.invoke("create-focus"),
  deleteFocus: (focusId) => ipcRenderer.invoke("delete-focus", focusId),
  onCurrentFocusUpdate: (callback) =>
    // ipcRenderer.on("current-focus-update", (_event, focusId, focus) =>
    //   callback(focusId, focus)
    // ),
    ipcRenderer.on("current-focus-update", (_event, updatedFocus) =>
      callback(updatedFocus)
    ),
  // getFocusIcons: () => ipcRenderer.invoke("get-focus-icons"),
};

// console.log("hello, world!");

contextBridge.exposeInMainWorld("_electronApi", contextBridgeApi);
