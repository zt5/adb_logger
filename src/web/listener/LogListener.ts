import { ipcRenderer } from "electron";
import { Log } from "../../msg/m2w/Log";
import { ClearLog } from "../../msg/m2w/ClearLog";
import { MsgObjChannel } from "../../define";
export class WebListenerLog {
    public listen() {
        let log = <HTMLDivElement>document.querySelector("#DivLog");
        let isPress = false;
        let isLockEnd = true;
        ipcRenderer.on(MsgObjChannel.Log, (evt, args: Log) => {
            let msgs = Array.isArray(args.content) ? args.content : [args.content];
            let el: DocumentFragment = document.createDocumentFragment();
            for (let i = 0; i < msgs.length; i++) {
                let div = document.createElement("div");
                div.innerText = msgs[i];
                el.appendChild(div);
            }
            log.appendChild(el);
            if (!isPress && isLockEnd) {
                log.scrollTop = log.scrollHeight
            }
        })
        document.onmousedown = (ev) => {
            isPress = ev.target == log;
        };
        document.onmouseup = () => {
            if (isPress) {
                isPress = false;
                isLockEnd = log.scrollTop + log.clientHeight + 20 >= log.scrollHeight;
            }
        };
        document.onclick = ev => { console.log(ev) };
        ipcRenderer.on(MsgObjChannel.ClearLog, (evt, args: ClearLog) => {
            log.innerText = "";
        })
    }
}