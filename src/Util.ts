import { app } from "electron";
import * as treekill from "tree-kill";
import path = require("path");
import os = require("os");
import * as iconv from "iconv-lite";
import { MyProgress } from "./typings/define";

export class Util {
    public static pathResolve(url: string) {
        if (app.isPackaged) {
            return path.join(app.getAppPath(), url);
        } else {
            return path.resolve(path.join(app.getAppPath(), "../", url));
        }
    }
    public static killProgress(progress: MyProgress) {
        if (!progress || progress.isDestroy) return;
        progress.isDestroy = true;
        return new Promise<void>((resolve, reject) => {
            treekill(progress.pid, () => {
                resolve();
            });
        });
    }
    public static bin2String(str: string) {
        switch (os.platform()) {
            case "win32":
                return iconv.decode(Buffer.from(str, "binary"), "gbk");
            default:
                return iconv.decode(Buffer.from(str, "binary"), "utf-8");
        }
    }
}