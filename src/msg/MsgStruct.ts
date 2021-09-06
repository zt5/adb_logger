export type Device = {
    state: DeviceState;
    serialNumber: string;
}
export enum DeviceState {
    OnLine = "device",
    OffLine = "offline",
    NoDevice = "no device",
}
export type Package = {
    progress?: PackageProgress;
    name: string;
}
export type PackageProgress = {
    PID: number;
    NAME: string;
}