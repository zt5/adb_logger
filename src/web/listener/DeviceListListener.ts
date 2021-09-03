import { ipcRenderer, IpcRendererEvent } from "electron";
import { DeviceList } from "../../msg/m2w/DeviceList";
import { Device, DeviceState, MsgObjChannel } from "../../define";

export class WebListenerDeviceList {
    private deviceElement: HTMLSelectElement;
    public listen() {
        this.deviceElement = <HTMLSelectElement>document.querySelector("#SelectDevice");
        this.setList([]);

        ipcRenderer.on(MsgObjChannel.DeviceList, this.deviceListHandler.bind(this));
    }
    private deviceListHandler(evt: IpcRendererEvent, args: DeviceList) {
        this.setList(args.content, args.select);
    }
    private setList(args: Device[], selectValue?: string) {
        this.deviceElement.options.length = 0;
        if (args.length) {
            this.deviceElement.disabled = false;
            for (let i = 0; i < args.length; i++) {
                let option = <HTMLOptionElement>document.createElement("option");
                if (args[i].serialNumber == selectValue) option.selected = true;
                switch (args[i].state) {
                    case DeviceState.OnLine:
                        option.innerText = `${args[i].serialNumber}:在线`
                        option.style.color = "green";
                        break;
                    case DeviceState.OffLine:
                        option.innerText = `${args[i].serialNumber}:离线`
                        option.style.color = "red";
                        break;
                    case DeviceState.NoDevice:
                        option.innerText = `${args[i].serialNumber}:无设备`
                        option.style.color = "gray";
                        break;
                }
                option.value = args[i].serialNumber;
                this.deviceElement.appendChild(option);
            }
        } else {
            this.deviceElement.disabled = true;
        }
    }
}