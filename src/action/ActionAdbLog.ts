import { ActionBase } from "./ActionBase";
import * as cp from "child_process";
import { Util } from "../Util";
import { MyProgress } from "../typings/define";

export class ActionAdbLog extends ActionBase {
    private progress: MyProgress;
    public async listen() {
        await this.destroy();
        if (!this.context.selectDevice) return;
        const args = [
            "-s",
            this.context.selectDevice,
            "logcat",
            "-v "
        ];
        if (this.context.selectPackage) {
            const { progress } = this.context.actQueryPackage.getPackageByName(this.context.selectPackage);
            if (progress) args.push(`|findstr "${progress.PID}"`);
        }
        this.watchProgress(this.context.adbExePath, args, this.context.adbCwdPath, value => {
            this.io.logWebView(value.split("\r\n"));
        });
    }
    public async destroy() {
        await Util.killProgress(this.progress);
    }
    private watchProgress(cmd: string, params: string[], cwd: string, progressFun?: (value: string) => void, resultFun?: () => void) {
        this.progress = cp.spawn(cmd, params, { cwd });
        if (this.progress.stdout) {
            this.progress.stdout.on('data', (data) => {
                if (this.progress.isDestroy) return;
                const msg = Util.bin2String(data);
                if (progressFun) progressFun(msg);
            });
        }
        if (this.progress.stderr) {
            this.progress.stderr.on('data', (data) => {
                if (this.progress.isDestroy) return;
                const msg = Util.bin2String(data);
                if (progressFun) progressFun(msg);
            });
        }
        this.progress.once('exit', (code) => {
            if (this.progress.isDestroy) return;
            this.progress.isDestroy = true;
            if (resultFun) resultFun();
        });
    }
}