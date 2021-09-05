
import { app, BrowserWindow } from "electron";
import * as path from "path";
import { MsgObj } from "./typings/define";
import { Logger } from "./logger/Logger";
import { Logic } from "./logic";


export let appWin: BrowserWindow;
export let appLogger = new Logger();


let logic = new Logic();
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
  logic.init();
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