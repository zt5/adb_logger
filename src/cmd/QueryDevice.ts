import { AppContext } from "../logic/AppContext";
import { Runner } from "../logic/Runner";
import { DeviceState } from "../msg/MsgStruct";

export class QueryDevice extends Runner {
    public async run() {
        this.context.devices = [];
        const deviceStr = await this.context.adb.run("devices");
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
        if (!this.context.devices) return undefined;
        return this.context.devices.find(item => item.serialNumber == name);
    }
    public selectDefault() {
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