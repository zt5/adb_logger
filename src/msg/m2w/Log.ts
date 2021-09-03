import { MsgObjChannel } from "../../define";
import { MsgObj } from "../../define";

export class Log extends MsgObj {
    public readonly channel = MsgObjChannel.Log;
    constructor(public content: string | string[]) { super(); }
}