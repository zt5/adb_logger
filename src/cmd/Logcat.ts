import * as cp from "child_process";
import { appLogger, immortal } from "../main";
import { MyProgress, PackageAll } from "../typings/define";
import { Util } from "../logic/Util";
import { Runner } from "../logic/Runner";

export class Logcat extends Runner {
    private progress: MyProgress;
    public async run() {
        await this.destroy();
        if (!this.context.selectDevice) return;
        const args = [
            "-s",
            this.context.selectDevice,
            "logcat",
            "--format=time"
        ];
        if (this.context.selectPackage && this.context.selectPackage != PackageAll) {
            const selPackage = this.context.queryPackage.getPackageByName(this.context.selectPackage);
            if (!selPackage || !selPackage.progress) return;
            args.push(`--pid=${selPackage.progress.PID}`);
        }
        appLogger.log(`adb logcat: ${this.context.adbExePath} ${args.join(" ")}`);

        this.progress = cp.spawn(this.context.adbExePath, args, { cwd: this.context.adbCwdPath });
        if (this.progress.stdout) this.progress.stdout.on('data', this.progressFun);
        if (this.progress.stderr) this.progress.stderr.on('data', this.errorFun);
        this.progress.on('exit', this.exitFun);
    }
    private exitFun = () => {
        if (this.progress.isDestroy) return;
        this.progress.isDestroy = true;
    }
    private errorFun = (data: any) => {
        if (this.progress.isDestroy) return;
        let logdata = Util.bin2String(data);
        appLogger.log(`adb logcat: ${logdata}`);
        immortal.logWebView(logdata.split("\r\n"));
    }
    private progressFun = (data: any) => {
        if (this.progress.isDestroy) return;
        let logdata = Util.bin2Utf8String(data);
        appLogger.log(`adb logcat: ${logdata}`);
        immortal.logWebView(logdata.split("\r\n"));
    }
    public async destroy() {
        if (this.progress) {
            if (this.progress.stdout) this.progress.stdout.off('data', this.progressFun);
            if (this.progress.stderr) this.progress.stderr.off('data', this.errorFun);
            this.progress.off('exit', this.exitFun);
        }
        await Util.killProgress(this.progress);
    }
}