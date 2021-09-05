import * as cp from "child_process";
export type MyProgress = cp.ChildProcess & {
    isDestroy?: boolean;
}
export abstract class MsgObj {
    public abstract channel: MsgObjChannel;
}
export enum MsgObjChannel {
    Log = "Log",
    ClearLog = "ClearLog",
    DeviceList = "DeviceList",
    PackageList = "PackageList",
}

export enum DeviceState {
    OnLine = "device",
    OffLine = "offline",
    NoDevice = "no device",
}
export type Progress = {
    PID: number;
    NAME: string;
}
export type Device = {
    state: DeviceState;
    serialNumber: string;
}
export type Package = {
    progress?: Progress;
    name: string;
}
