import { Device, MsgObjChannel } from "../../define";
import { MsgObj } from "../../define";

export class DeviceList extends MsgObj {
    public readonly channel = MsgObjChannel.DeviceList;
    constructor(public content: Device[], public select: string) { super(); }
}