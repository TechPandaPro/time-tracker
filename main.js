import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  ipcMain,
} from "electron";
import Store from "electron-store";
import path from "path";
// const { app, Menu, Tray } = require("electron");

if (process.platform !== "darwin") throw new Error("Platform not supported");

let isQuitting = false;

const electronStore = new Store({
  defaults: {
    data: {
      dailyLog: [],
      focuses: [
        { name: "Sleep", id: "focus_0", dailyGoal: 1000 * 60 * 30 },
        { name: "Other", id: "focus_1", dailyGoal: 0 },
      ],
      nextFocusNum: 2,
    },
  },
});

console.log(app.getPath("userData"));

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");

  win.webContents.openDevTools({ mode: "detach" });

  win.on("close", (e) => {
    if (!isQuitting) e.preventDefault();
    win.hide();
  });
};

let tray = null;

app.whenReady().then(() => {
  ipcMain.handle("get-data", (_event) => {
    console.log("retrieving data");
    const data = electronStore.get("data");
    // console.log(data);
    return data;
  });

  tray = new Tray("trayIcon_16x16.png");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Time Tracker",
      accelerator: "CommandOrControl+Alt+Shift+T",
      click: focusWindow,
    },
    { type: "separator" },
    {
      label: "Start Timer",
      type: "normal",
      accelerator: "CommandOrControl+Alt+Shift+S",
      click: () => console.log("start timer"),
    },
    {
      label: "Stop Timer",
      type: "normal",
      accelerator: "CommandOrControl+Alt+Shift+P",
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Set Focus",
      type: "submenu",
      submenu: Menu.buildFromTemplate([
        {
          label: "Other",
          type: "radio",
          accelerator: "CommandOrControl+Alt+Shift+1",
          checked: true,
        },
      ]),
    },
    { type: "separator" },
    { role: "quit", accelerator: "CommandOrControl+Q" },
  ]);
  // tray.setToolTip("test tooltip");
  tray.setContextMenu(contextMenu);
  createWindow();

  app.on("before-quit", () => {
    isQuitting = true;
  });

  app.on("activate", focusWindow);

  function focusWindow() {
    const window = BrowserWindow.getAllWindows()[0];
    if (window) {
      // if (!window.isVisible()) window.show();
      window.show();
    } else {
      createWindow();
    }
  }

  // prevent automatically quitting
  // app.on("window-all-closed", () => {});

  // globalShortcut.register("CommandOrControl+Alt+Shift+S", () =>
  //   console.log("start timer (global listener))")
  // );

  // function startTimer() {
  //   console.log("start timer");
  // }
});
