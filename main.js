import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  // globalShortcut,
  ipcMain,
} from "electron";
import Store from "electron-store";
import { readdirSync } from "fs";
import path from "path";
// const { app, Menu, Tray } = require("electron");

if (process.platform !== "darwin") throw new Error("Platform not supported");

let isQuitting = false;

const focusIcons = readdirSync("focus_icons")
  .filter((fileName) => fileName.endsWith(".svg"))
  .map((fileName) => fileName.split(".")[0]);

const electronStore = new Store({
  defaults: {
    data: {
      dailyLog: [],
      focuses: [
        {
          name: "Sleep",
          id: "focus_0",
          icon: "book",
          dailyGoal: 1000 * 60 * 30,
        },
        {
          name: "Other",
          id: "focus_1",
          icon: "book",
          dailyGoal: 0,
        },
      ],
      currentFocus: "focus_1",
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

  ipcMain.handle("update-focus-icon", (_event, focusId, newIcon) => {
    // if ()
    const focuses = electronStore.get("data.focuses");
    const focus = focuses.find((focus) => focus.id === focusId);
    if (!focus) return { success: false, message: "Focus not found" };
    if (!focusIcons.includes(newIcon))
      return { success: false, message: "Icon not found" };
    focus.icon = newIcon;
    electronStore.set("data.focuses", focuses);
    updateContextMenu();
    return { success: true, message: "Focus icon updated" };
  });

  ipcMain.handle("update-focus-name", (_event, focusId, newName) => {
    // if ()
    const focuses = electronStore.get("data.focuses");
    const focus = focuses.find((focus) => focus.id === focusId);
    if (!focus) return { success: false, message: "Focus not found" };
    if (typeof newName !== "string")
      return { success: false, message: "Name is not a string" };
    focus.name = newName;
    electronStore.set("data.focuses", focuses);
    updateContextMenu();
    return { success: true, message: "Focus name updated" };
  });

  ipcMain.handle("update-focus-goal", (_event, focusId, newGoalMs) => {
    // if ()
    const focuses = electronStore.get("data.focuses");
    const focus = focuses.find((focus) => focus.id === focusId);
    if (!focus) return { success: false, message: "Focus not found" };
    if (Number.isNaN(newGoalMs))
      return { success: false, message: "Goal is not a number" };
    focus.dailyGoal = newGoalMs;
    console.log(focuses);
    electronStore.set("data.focuses", focuses);
    return { success: true, message: "Focus goal updated" };
  });

  ipcMain.handle("create-focus", (_event) => {
    const { focuses, nextFocusNum } = electronStore.get("data");

    // const nextFocusNum = electronStore.get("data.nextFocusNum");
    electronStore.set("data.nextFocusNum", nextFocusNum + 1);

    // const focuses = electronStore.get("data.focuses");
    const newFocus = {
      name: "Untitled",
      id: `focus_${nextFocusNum}`,
      icon: "file",
      dailyGoal: 1000 * 60 * 60,
    };

    focuses.push(newFocus);

    electronStore.set("data.focuses", focuses);

    updateContextMenu();

    return newFocus;
  });

  ipcMain.handle("delete-focus", (_event, focusId) => {
    const { focuses, currentFocus } = electronStore.get("data");

    const focusIndex = focuses.findIndex((focus) => focus.id === focusId);
    if (focusIndex === -1)
      return { success: false, message: "Focus not found" };

    const newFocuses = focuses.filter((focus) => focus.id !== focusId);
    if (newFocuses.length === 0)
      return { success: false, message: "At least one focus must exist" };

    electronStore.set("data.focuses", newFocuses);

    if (currentFocus === focusId) {
      const newCurrentFocus =
        focusIndex >= newFocuses.length - 1
          ? newFocuses[newFocuses.length - 1]
          : newFocuses[focusIndex];

      const newCurrentFocusId = newCurrentFocus.id;

      electronStore.set("data.currentFocus", newCurrentFocusId);
    }

    updateContextMenu();

    return { success: true, message: "Focus deleted" };
  });

  // ipcMain.handle("get-focus-icons", (_event) => {});

  tray = new Tray("trayIcon_16x16.png");
  updateContextMenu();
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

  function updateContextMenu() {
    const { focuses, currentFocus } = electronStore.get("data");

    const currentIconName = focuses.find(
      (focus) => focus.id === currentFocus
    )?.icon;

    tray.setImage(
      currentIconName
        ? `focus_icons/${currentIconName}.png`
        : "trayIcon_16x16.png"
    );

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
        submenu: Menu.buildFromTemplate(
          focuses.map((focus, index) => ({
            label: focus.name,
            icon: `focus_icons/${focus.icon}.png`,
            type: "radio",
            accelerator:
              index + 1 <= 9
                ? `CommandOrControl+Alt+Shift+${index + 1}`
                : undefined,
            checked: currentFocus === focus.id,
            click: () => {
              electronStore.set("data.currentFocus", focus.id);
              updateContextMenu();
            },
          }))
        ),
      },
      { type: "separator" },
      { role: "quit", accelerator: "CommandOrControl+Q" },
    ]);
    // tray.setToolTip("test tooltip");
    tray.setContextMenu(contextMenu);
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
