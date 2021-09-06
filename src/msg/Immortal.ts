import { appLogger, appWin } from "../main";
import { MsgObj } from "../typings/define";
import { ClearLog } from "./m2w/ClearLog";
import { Log } from "./m2w/Log";
import { Mask } from "./m2w/Mask";

export class Immortal {
    public logWebView(msg: string | string[]) {
        if (Array.isArray(msg)) {
            this.cmdToWebview(new Log(msg));
        }
        else if (typeof msg == "string") {
            this.cmdToWebview(new Log(`${msg}\n`));
        }
    }
    public cmdToWebview(msg: MsgObj) {
        appLogger.log(msg);
        if (appWin == null || appWin.isDestroyed()) return;
        appWin.webContents.send(msg.channel, msg);
    }
    public clearLog() {
        this.cmdToWebview(new ClearLog())
    }
    public mask(visible: boolean) {
        this.cmdToWebview(new Mask(visible));
    }

}