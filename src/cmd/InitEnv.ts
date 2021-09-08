import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as AdmZip from "adm-zip";
import { appLogger } from "../main";
import { Util } from "../logic/Util";
import { Runner } from "../logic/Runner";

export class InitEnv extends Runner {
    public async run() {
        const [adbZipName, adbExeName] = this.getADBZipName();
        if (!adbZipName || !adbExeName) throw new Error("unsupport platform: " + os.platform());
        this.context.adbZipPath = Util.pathResolve("/assets/adb/" + adbZipName);
        appLogger.log(`adbZipPath: ${this.context.adbZipPath}`);
        this.context.adbExtractPath = path.join(Util.dataPath(), "/assets/adb");
        appLogger.log(`adbExtracPath: ${this.context.adbExtractPath}`);
        this.context.adbExePath = path.join(this.context.adbExtractPath, "/platform-tools/", adbExeName);
        appLogger.log(`adbExePath: ${this.context.adbExePath}`);
        this.context.adbCwdPath = path.join(Util.dataPath(), "/assets/adb/platform-tools");
        appLogger.log(`adbCwdPath: ${this.context.adbCwdPath}`);
        await this.checkAdb();
    }
    private checkAdb() {
        return new Promise<void>((resolve, reject) => {
            if (fs.existsSync(this.context.adbExePath)) {
                resolve();
            } else {
                var zip = new AdmZip(fs.readFileSync(this.context.adbZipPath));
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