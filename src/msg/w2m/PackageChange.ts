import { MsgObj, MsgObjChannel } from "../../typings/define";

export class PackageChange extends MsgObj {
    public readonly channel = MsgObjChannel.PackageChange;
    constructor(public value: string) { super(); }
}