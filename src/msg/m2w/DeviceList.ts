import { MsgObj, MsgObjChannel } from "../../typings/define";
import { Device } from "../MsgStruct";

export class DeviceList extends MsgObj {
    public readonly channel = MsgObjChannel.DeviceList;
    constructor(public content: Device[], public select: string) { super(); }
}