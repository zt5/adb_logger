import { app } from "electron";
import * as iconv from "iconv-lite";
import * as os from "os";
import * as path from "path";
import * as treekill from "tree-kill";
import { MyProgress } from "../typings/define";

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
                return Util.bin2GbkString(str);
            default:
                return Util.bin2Utf8String(str);
        }
    }
    public static bin2GbkString(str: string) {
        return iconv.decode(Buffer.from(str, "binary"), "gbk");
    }
    public static bin2Utf8String(str: string) {
        return iconv.decode(Buffer.from(str, "binary"), "utf-8");
    }
    public static convertObjStr(msg: string | number | boolean | Error | unknown) {
		if (typeof msg == "string") return msg;
		else if (typeof msg == "number") return `${msg}`;
		else if (typeof msg == "boolean") return `${msg}`;
		else if (msg instanceof Error) {
			if (msg.stack) return msg.stack;
			else return msg.message;
		}
		else if (msg === null || msg === undefined) return `${msg}`;
		else return JSON.stringify(msg);
	}

}