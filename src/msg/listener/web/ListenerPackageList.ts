import { ipcRenderer, IpcRendererEvent } from "electron";
import { InitPackage, MsgObjChannel, PackageAll } from "../../../typings/define";
import { PackageList } from "../../m2w/PackageList";
import { Package } from "../../MsgStruct";
import { PackageChange } from "../../w2m/PackageChange";

export class ListenerPackageList {
    private packElement: HTMLSelectElement;
    public listen() {
        this.packElement = <HTMLSelectElement>document.querySelector("#SelectPackage");
        this.setList(InitPackage(), PackageAll);

        ipcRenderer.on(MsgObjChannel.PackageList, this.packageListHandler.bind(this));
        this.packElement.addEventListener("change", this.onSelectChange.bind(this))
    }
    private onSelectChange() {
        const selValue = this.packElement.options[this.packElement.selectedIndex].value;
        ipcRenderer.send(MsgObjChannel.PackageChange, new PackageChange(selValue))
    }
    private packageListHandler(evt: IpcRendererEvent, args: PackageList) {
        this.setList(args.content, args.select);
    }
    private setList(args: Package[], selectValue?: string) {
        this.packElement.options.length = 0;
        this.packElement.disabled = args.length == 1 && args[0].name == PackageAll;
        console.log(args, selectValue);
        for (let i = 0; i < args.length; i++) {
            let option = <HTMLOptionElement>document.createElement("option");
            if (args[i].name == selectValue) option.selected = true;
            option.value = args[i].name;
            if (args[i].name == PackageAll) {
                option.innerText = `全部进程`
                option.style.color = "yellow";
            } else if (args[i].progress) {
                option.innerText = `${args[i].name}:在线`
                option.style.color = "green";
            } else {
                option.innerText = `${args[i].name}:离线`
                option.style.color = "red";
            }
            this.packElement.appendChild(option);
        }
    }
}