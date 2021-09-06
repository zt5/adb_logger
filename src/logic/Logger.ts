import fs = require("fs");
import { Util } from "./Util";
export class Logger {
    private readonly logWriteQueue: string[];
    private readonly logFilePath: string;
    private checkQueueTimer: NodeJS.Timer | undefined;
    constructor() {
        this.logWriteQueue = [];
        this.logFilePath = Util.pathResolve("log.txt");
        fs.writeFileSync(this.logFilePath, "", "utf-8");//清空内容
    }
    /**App日志打印*/
    public log(...args: any[]) {
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            this.logWriteQueue.push(`${Util.convertObjStr(arg)}\n`);
        }
        this.checkQueue();
    }
    private checkQueue() {
        if (this.checkQueueTimer) return;
        this.checkQueueTimer = setInterval(() => {
            if (this.logWriteQueue.length) {
                let str = this.logWriteQueue.shift();
                // console.log(str);
                fs.writeFileSync(this.logFilePath, str, { encoding: "utf-8", flag: "a" })
            } else {
                clearInterval(this.checkQueueTimer);
                this.checkQueueTimer = undefined;
            }
        }, 100);
    }
}