import { MsgObj, MsgObjChannel } from "../../typings/define";

export class ClearLog extends MsgObj {
    public readonly channel = MsgObjChannel.ClearLog;
}