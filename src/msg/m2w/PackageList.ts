import { MsgObjChannel, Package } from "../../typings/define";
import { MsgObj } from "../../typings/define";

export class PackageList extends MsgObj {
    public readonly channel = MsgObjChannel.PackageList;
    constructor(public content: Package[], public select: string) { super(); }
}