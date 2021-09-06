
import { app, BrowserWindow } from "electron";
import * as path from "path";
import { Logger } from "./logic/Logger";
import { App } from "./logic/App";
import { Immortal } from "./msg/Immortal";

export let appWin: BrowserWindow;
export let appLogger = new Logger();
export let immortal = new Immortal();
export let myApp = new App();

async function createWindow() {
  appWin = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nativeWindowOpen: true
    },
    width: 800,
  });
  appWin.loadFile(path.join(__dirname, "../assets/html/index.html"));
  myApp.init();
}
app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});