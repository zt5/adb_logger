import { Adb } from "../cmd/Adb";
import { ClearAdbLog } from "../cmd/ClearAdbLog";
import { InitEnv } from "../cmd/InitEnv";
import { QueryDevice } from "../cmd/QueryDevice";
import { QueryPackage } from "../cmd/QueryPackage";
import { Logcat } from "../cmd/Logcat";
import { Device, Package } from "../msg/MsgStruct";

export interface AppContext {

    //设备列表
    devices: Device[];
    //包列表
    packages: Package[];
    //选中的设备
    selectDevice: string;
    //选中的包名
    selectPackage: string;

    //执行adb命令action
    adb: Adb,
    //执行查询设备action
    queryDevice: QueryDevice,
    //执行adb初始化action
    initEnv: InitEnv,
    //执行查询包名action
    queryPackage: QueryPackage,
    //adb日志进程action
    logcat: Logcat,
    //清理adb日志action
    clearAdb: ClearAdbLog,
    //adb压缩包的路径
    adbZipPath?: string,
    //adb压缩包解压路径
    adbExtractPath?: string,
    //adb执行文件路径
    adbExePath?: string,
    //adb执行环境路径
    adbCwdPath?: string,

    //更新方法
    update: () => Promise<void>;

}