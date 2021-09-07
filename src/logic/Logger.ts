import * as fs from "fs";
import * as path from "path";
import { Util } from "./Util";
export class Logger {
    private readonly logWriteQueue: { url: LogStream, content: string }[];
    private readonly logFilePath: string;
    private readonly logAppPath: LogStream;
    private readonly logAdbPath: LogStream;
    private isWriting: boolean;
    constructor() {
        this.isWriting = false;
        this.logWriteQueue = [];
        this.logFilePath = Util.logPath();
        console.log("logFilePath: " + this.logFilePath);

        const time = new Date().getTime();

        this.logAppPath = new LogStream(path.join(this.logFilePath, `app_${time}.log`));
        console.log("logAppPath: " + this.logAppPath);

        this.logAdbPath = new LogStream(path.join(this.logFilePath, `adb_${time}.log`));
        console.log("logAdbPath: " + this.logAdbPath);
    }
    /**App日志打印*/
    public log(...args: any[]) {
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            this.logWriteQueue.push({ url: this.logAppPath, content: `${Util.convertObjStr(arg)}\n` });
        }
        this.checkQueue();
    }
    /**App日志打印*/
    public adbLog(...args: any[]) {
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            this.logWriteQueue.push({ url: this.logAdbPath, content: `${Util.convertObjStr(arg)}` });
        }
        this.checkQueue();
    }
    private checkQueue() {
        if (this.isWriting) return;
        this.isWriting = true;
        if (this.logWriteQueue.length) {
            let { content, url } = this.logWriteQueue.shift();
            url.write(content, err => {
                if (err) console.error(err);
                this.isWriting = false;
                this.checkQueue();
            })
        } else {
            this.isWriting = false;
        }
    }
}
class LogStream {
    private file: string;
    private stream: fs.WriteStream;
    constructor(file: string) {
        this.file = file;
        const parentFolder = path.dirname(this.file);
        if (!fs.existsSync(parentFolder)) fs.mkdirSync(parentFolder, { recursive: true });
        fs.writeFileSync(this.file, "", "utf-8");//清空内容
        this.stream = fs.createWriteStream(this.file, { encoding: "utf-8", flags: "a" });
    }
    public write(data: string, callback: (err: Error) => void) {
        this.stream.write(data, callback)
    }
    public toString() {
        return `{file:${this.file}}`;
    }
}