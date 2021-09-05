import * as cp from "child_process";
import { MyProgress } from "../typings/define";
import { Util } from "../Util";
import { ActionBase } from "./ActionBase";

export class ActionAdbCmd extends ActionBase {
    private progress: MyProgress[] = [];
    public async exec(...cmd: string[]) {
        return await this.onceProgress(this.context.adbExePath, cmd, this.context.adbCwdPath);
    }
    private onceProgress(cmd: string, params: string[], cwd: string) {
        return new Promise<string>(resolve => {
            let str = "";
            const progress: MyProgress = cp.spawn(cmd, params, { cwd });
            this.progress.push(progress);
            if (progress.stdout) {
                progress.stdout.on('data', (data) => {
                    if (progress.isDestroy) return;
                    const msg = Util.bin2String(data);
                    str += msg;
                });
            }
            if (progress.stderr) {
                progress.stderr.on('data', (data) => {
                    if (progress.isDestroy) return;
                    const msg = Util.bin2String(data);
                    str += msg;
                });
            }
            progress.once('exit', (code) => {
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