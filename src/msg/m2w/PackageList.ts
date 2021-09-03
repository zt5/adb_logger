import { MsgObjChannel } from "../../define";
import { MsgObj } from "../../define";

export class PackageList extends MsgObj {
    public readonly channel = MsgObjChannel.PackageList;
    constructor(public content: string[], public select: string) { super(); }
}