import { MsgObj, MsgObjChannel } from "../../typings/define";
import { Package } from "../MsgStruct";

export class PackageList extends MsgObj {
    public readonly channel = MsgObjChannel.PackageList;
    constructor(public content: Package[], public select: string) { super(); }
}