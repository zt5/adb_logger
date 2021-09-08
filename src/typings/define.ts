import * as cp from "child_process";
import { Package } from "../msg/MsgStruct";
export type MyProgress = cp.ChildProcess & { isDestroy?: boolean }
export enum MsgObjChannel {
    Log = "Log",

    ClearLog = "ClearLog",

    DeviceList = "DeviceList",

    PackageList = "PackageList",
    PackageChange = "PackageChange",

    PageList = "PageList",
    PageChange = "PageChange",

    Mask = "Mask",
}
export abstract class MsgObj {
    public abstract channel: MsgObjChannel;
}
export const InitPage = 0;
export const PackageAll = "PackageAll";
export let InitPackage = function () {
    return <Package[]>[{ name: PackageAll }];
}