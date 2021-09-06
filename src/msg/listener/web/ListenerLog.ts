import { ipcRenderer, IpcRendererEvent } from "electron";
import { MsgObjChannel } from "../../../typings/define";
import { ClearLog } from "../../m2w/ClearLog";
import { Log } from "../../m2w/Log";
export class ListenerLog {
    private isPress = false;
    private isLockEnd = true;
    private log: HTMLDivElement;
    public listen() {
        this.log = <HTMLDivElement>document.querySelector("#DivLog");
        this.isPress = false;
        this.isLockEnd = true;
        ipcRenderer.on(MsgObjChannel.Log, this.logHandler.bind(this))
        document.onmousedown = this.mouseDownHandler.bind(this);
        document.onmouseup = this.mouseUpHandler.bind(this);
        document.onmousewheel = this.mouseWhellHandler.bind(this);
        ipcRenderer.on(MsgObjChannel.ClearLog, this.clearLogHandler.bind(this))
    }
    private mouseWhellHandler(ev: MouseEvent) {
        this.isLockEnd = this.log.scrollTop + this.log.clientHeight + 20 >= this.log.scrollHeight;
    }
    private mouseUpHandler(ev: MouseEvent) {
        if (this.isPress) {
            this.isPress = false;
            this.isLockEnd = this.log.scrollTop + this.log.clientHeight + 20 >= this.log.scrollHeight;
        }
    }
    private mouseDownHandler(ev: MouseEvent) {
        this.isPress = ev.target == this.log;
    }
    private clearLogHandler(evt: IpcRendererEvent, args: ClearLog) {
        this.log.innerHTML = "";
    }
    private logHandler(evt: IpcRendererEvent, args: Log) {
        let msgs = Array.isArray(args.content) ? args.content : [args.content];
        let el: DocumentFragment = document.createDocumentFragment();
        for (let i = 0; i < msgs.length; i++) {
            if (msgs[i].trim() == "") continue;
            let div = document.createElement("div");
            div.innerText = msgs[i];
            div.classList.add("logItem");
            el.appendChild(div);
        }
        this.log.appendChild(el);
        if (!this.isPress && this.isLockEnd) {
            this.log.scrollTop = this.log.scrollHeight
        }
    }
}