import { Device, MsgObjChannel } from "../../typings/define";
import { MsgObj } from "../../typings/define";

export class DeviceList extends MsgObj {
    public readonly channel = MsgObjChannel.DeviceList;
    constructor(public content: Device[], public select: string) { super(); }
}