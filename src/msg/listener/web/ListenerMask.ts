import { ipcRenderer, IpcRendererEvent } from "electron";
import { MsgObjChannel } from "../../../typings/define";
import { Mask } from "../../m2w/Mask";

export class ListenerMask {
    private packElement: HTMLDivElement;
    public listen() {
        this.packElement = <HTMLDivElement>document.querySelector("#DivMask");

        ipcRenderer.on(MsgObjChannel.Mask, this.visibleChangeHandler.bind(this));
    }
    private visibleChangeHandler(evt: IpcRendererEvent, args: Mask) {
        this.packElement.style.visibility = args.visible ? "visible" : "hidden";
    }
}