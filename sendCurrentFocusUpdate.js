import { BrowserWindow } from "electron";
import electronStore from "./electronStore.js";
import { getSessionStartStamp } from "./timeHandler.js";

export default function sendCurrentFocusUpdate() {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  const { focuses, currentFocus: currentFocusId } = electronStore.get("data");
  if (!currentFocusId) throw new Error("No current focus");
  const currentFocus = focuses.find((focus) => focus.id === currentFocusId);
  mainWindow.webContents.send("current-focus-update", {
    ...currentFocus,
    selectedSince: getSessionStartStamp(),
  });
}
