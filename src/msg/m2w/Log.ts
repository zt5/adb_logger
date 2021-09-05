import { MsgObjChannel } from "../../typings/define";
import { MsgObj } from "../../typings/define";

export class Log extends MsgObj {
    public readonly channel = MsgObjChannel.Log;
    constructor(public content: string | string[]) { super(); }
}