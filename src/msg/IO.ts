import { MsgObj } from "../typings/define";
import { appWin } from "../main";
import { Log } from "./m2w/Log";

export class IO {
    public logWebView(msg: string | string[]) {
        if (Array.isArray(msg)) {
            this.cmdToWebview(new Log(msg));
        }
        else if (typeof msg == "string") {
            this.cmdToWebview(new Log(`${msg}\n`));
        }
    }
    public cmdToWebview(msg: MsgObj) {
        console.log(JSON.stringify(msg));
        if (appWin == null || appWin.isDestroyed()) return;
        appWin.webContents.send(msg.channel, msg);
    }

}