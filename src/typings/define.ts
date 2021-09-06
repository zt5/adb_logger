import * as cp from "child_process";
export type MyProgress = cp.ChildProcess & { isDestroy?: boolean }
export enum MsgObjChannel {
    Log = "Log",
    ClearLog = "ClearLog",
    DeviceList = "DeviceList",
    PackageList = "PackageList",
    Mask = "Mask",
    PackageChange = "PackageChange",
}
export abstract class MsgObj {
    public abstract channel: MsgObjChannel;
}