import * as cp from "child_process";
import { MyProgress } from "../typings/define";
import { Util } from "../logic/Util";
import { Runner } from "../logic/Runner";
import { appLogger } from "../main";

export class Adb extends Runner {
    private progress: MyProgress[] = [];
    public async run(...cmd: string[]) {
        appLogger.log(`adb: ${this.context.adbExePath} ${cmd.join(" ")}`);
        return await this.onceProgress(this.context.adbExePath, cmd, this.context.adbCwdPath);
    }
    private onceProgress(cmd: string, params: string[], cwd: string) {
        return new Promise<string>(resolve => {
            let str = "";
            const progress: MyProgress = cp.spawn(cmd, params, { cwd });
            this.progress.push(progress);

            let progressFun = (data: any) => {
                if (progress.isDestroy) return;
                str += Util.bin2Utf8String(data);
                appLogger.log(`adb progress data: ${str}`);
            }
            let errorFun = (data: any) => {
                if (progress.isDestroy) return;
                str += Util.bin2String(data);
                appLogger.log(`adb error data: ${str}`);
                if (str.trim() == "- waiting for device -") {
                    Util.killProgress(progress).then(() => {
                        resolve(str);
                    })
                }
            }

            if (progress.stdout) progress.stdout.on('data', progressFun);
            if (progress.stderr) progress.stderr.on('data', errorFun);
            progress.once('exit', () => {
                if (progress.stdout) progress.stdout.off('data', progressFun);
                if (progress.stderr) progress.stderr.off('data', errorFun);
                if (progress.isDestroy) return;
                progress.isDestroy = true;
                let index = this.progress.indexOf(progress);
                if (index != -1) this.progress.splice(index, 1);
                resolve(str);
            });
        })
    }
    public async destroy() {
        for (let i = 0; i < this.progress.length; i++) {
            await Util.killProgress(this.progress[i]);
        }
        this.progress.splice(0, this.progress.length);
    }
}