import { appLogger } from "../main";
import { DeviceState } from "../typings/define";
import { ActionBase } from "./ActionBase";
import { AppContext } from "./AppContext";

export class ActionQueryDevice extends ActionBase {
    public async query() {
        this.context.devices = [];
        const deviceStr = await this.context.actAdbCmd.exec("devices");
        this.parseDevice(deviceStr, this.context);

    }
    private parseDevice(queryDevices: string, context: AppContext) {
        const logs = queryDevices.split("\r\n")
            .map(item => item.trim())
            .filter(item => /^.*\s+(device|offline|no device)$/g.test(item));
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i].split("\t").filter(item => item);
            const serialNumber = log[0];
            const state = <DeviceState>log[1];
            context.devices.push({ serialNumber, state })
        }
    }
    public getDeviceByName(name: string) {
        return this.context.devices.find(item => item.serialNumber == name);
    }
    public selectDefaultDevice() {
        if (this.context.selectDevice == null) {
            if (this.context.devices.length) {
                this.context.selectDevice = this.context.devices[0].serialNumber;
            }
        } else {
            let finded = false;
            for (let i = 0; i < this.context.devices.length; i++) {
                if (this.context.devices[i].serialNumber == this.context.selectDevice) {
                    finded = true;
                    break;
                }
            }
            if (!finded) this.context.selectDevice = null;
        }
    }
}