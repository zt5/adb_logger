import { ipcRenderer, IpcRendererEvent } from "electron";
import { PackageList } from "../../msg/m2w/PackageList";
import { MsgObjChannel, Package } from "../../typings/define";

export class WebListenerPackageList {
    private packElement: HTMLSelectElement;
    public listen() {
        this.packElement = <HTMLSelectElement>document.querySelector("#SelectPackage");
        this.setList([]);

        ipcRenderer.on(MsgObjChannel.PackageList, this.packageListHandler.bind(this));
    }
    private packageListHandler(evt: IpcRendererEvent, args: PackageList) {
        this.setList(args.content, args.select);
    }
    private setList(args: Package[], selectValue?: string) {
        this.packElement.options.length = 0;
        if (args.length) {
            this.packElement.disabled = false;
            for (let i = 0; i < args.length; i++) {
                let option = <HTMLOptionElement>document.createElement("option");
                if (args[i].name == selectValue) option.selected = true;
                option.value = args[i].name;
                if (args[i].progress) {
                    option.innerText = `${args[i].name}:在线`
                    option.style.color = "green";
                } else {
                    option.innerText = `${args[i].name}:离线`
                    option.style.color = "red";
                }
                this.packElement.appendChild(option);
            }
        } else {
            this.packElement.disabled = true;
        }
    }
}