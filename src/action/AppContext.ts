import { Progress, Device, Package } from "../typings/define";
import { ActionAdbCmd } from "./ActionAdbCmd";
import { ActionAdbLog } from "./ActionAdbLog";
import { ActionInitAdb } from "./ActionInitAdb";
import { ActionQueryDevice } from "./ActionQueryDevice";
import { ActionQueryPackage } from "./ActionQueryPackage";

export class AppContext {
    //adb压缩包名字(不同平台不一样)
    public adbZipName: string;
    //adb执行文件名(不同平台不一样)
    public adbExeName: string;
    //adb压缩包的路径
    public adbZipPath: string;
    //adb压缩包解压路径
    public adbExtractPath: string;
    //adb执行文件路径
    public adbExePath: string;
    //adb执行环境路径
    public adbCwdPath: string;
    //设备列表
    public devices: Device[];
    //包列表
    public packages: Package[];
    //选中的设备
    public selectDevice: string;
    //选中的包名
    public selectPackage: string;

    //执行adb命令action
    public actAdbCmd: ActionAdbCmd;
    //执行查询设备action
    public actQueryDevice: ActionQueryDevice;
    //执行adb初始化action
    public actInitAdb: ActionInitAdb;
    //执行查询包名action
    public actQueryPackage: ActionQueryPackage;
    //adb日志进程action
    public actLogListen: ActionAdbLog;
}