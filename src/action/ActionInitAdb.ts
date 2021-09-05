import os = require("os");
import * as AdmZip from "adm-zip";
import { appLogger } from "../main";
import { Util } from "../Util";
import { ActionBase } from "./ActionBase";
import fs = require("fs");

export class ActionInitAdb extends ActionBase {
    public async exec() {
        const [adbZipName, adbExeName] = this.getADBZipName();
        if (!adbZipName || !adbExeName) throw new Error("unsupport platform: " + os.platform());
        this.context.adbZipName = adbZipName;
        this.context.adbExeName = adbExeName;
        this.context.adbZipPath = Util.pathResolve("/assets/adb/" + adbZipName);
        appLogger.log(`adbZipPath: ${this.context.adbZipPath}`);
        this.context.adbExtractPath = Util.pathResolve("/assets/adb");
        appLogger.log(`adbExtracPath: ${this.context.adbExtractPath}`);
        this.context.adbExePath = Util.pathResolve("/assets/adb/platform-tools/" + adbExeName);
        appLogger.log(`adbExePath: ${this.context.adbExePath}`);
        this.context.adbCwdPath = Util.pathResolve("/assets/adb/platform-tools");
        appLogger.log(`adbCwdPath: ${this.context.adbCwdPath}`);
        await this.checkAdb();
    }
    private checkAdb() {
        return new Promise<void>((resolve, reject) => {
            if (fs.existsSync(this.context.adbExePath)) {
                resolve();
            } else {
                var zip = new AdmZip(this.context.adbZipPath);
                zip.extractAllToAsync(this.context.adbExtractPath, true, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    }
    private getADBZipName(): [string, string] {
        switch (os.platform()) {
            case "win32":
                return ["platform-tools_r31.0.3-windows.zip", "adb.exe"];
            case "darwin":
                return ["platform-tools_r31.0.3-darwin.zip", "adb"];
            case "linux":
                return ["platform-tools_r31.0.3-linux.zip", "adb"];
        }
    }
}