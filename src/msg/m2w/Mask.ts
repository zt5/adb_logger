import { MsgObj, MsgObjChannel } from "../../typings/define";

export class Mask extends MsgObj {
    public readonly channel = MsgObjChannel.Mask;
    constructor(public visible: boolean) { super(); }
}