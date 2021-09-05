import { MsgObjChannel } from "../../typings/define";
import { MsgObj } from "../../typings/define";

export class ClearLog extends MsgObj {
    public readonly channel = MsgObjChannel.ClearLog;
}