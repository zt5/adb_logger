import { MsgObjChannel } from "../../define";
import { MsgObj } from "../../define";

export class ClearLog extends MsgObj {
    public readonly channel = MsgObjChannel.ClearLog;
}