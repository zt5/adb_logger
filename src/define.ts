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
    USER: string;
    PID: number;
    PPID: number;
    VSIZE: number;
    RSS: number;
    WCHAN: string;
    PC: string;
    NAME_PROGRESS: string;
    NAME: string;
}
export type Device = {
    state: DeviceState;
    serialNumber: string;
}