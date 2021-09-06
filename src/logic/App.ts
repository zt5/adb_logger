import { Menu } from "electron";
import { Adb } from "../cmd/Adb";
import { ClearAdbLog } from "../cmd/ClearAdbLog";
import { InitEnv } from "../cmd/InitEnv";
import { QueryDevice } from "../cmd/QueryDevice";
import { QueryPackage } from "../cmd/QueryPackage";
import { Logcat } from "../cmd/Logcat";
import { AppContext } from "./AppContext";
import { appLogger, immortal } from "../main";
import { ListenerPackageChange } from "../msg/listener/native/ListenerPackageChange";
import { DeviceList } from "../msg/m2w/DeviceList";
import { PackageList } from "../msg/m2w/PackageList";
import { Device, Package } from "../msg/MsgStruct";

export class App implements AppContext {
    private template: Electron.MenuItemConstructorOptions[] = [
        {
            label: '切换开发者工具',
            accelerator: 'CmdOrCtrl+I',
            role: "toggleDevTools"
        }, {
            label: '重新加载',
            accelerator: 'CmdOrCtrl+R',
            role: "reload"
        }, {
            label: '重启adb服务器',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
                this.restartServer().then(() => {
                    immortal.logWebView(`重启完成`);
                }).catch(err => {
                    immortal.logWebView(`${JSON.stringify(err)}`);
                })
            }
        }, {
            label: '清空日志',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
                immortal.clearLog()
            }
        }, {
            label: '刷新设备',
            accelerator: 'CmdOrCtrl+Y',
            click: () => {
                if (!this.devices || this.devices.length == 0) {
                    this.restartServer();
                } else {
                    this.update();
                }
            }
        }
    ];
    public devices: Device[];
    public packages: Package[];
    public selectDevice: string;
    public selectPackage: string;
    public adb: Adb;
    public queryDevice: QueryDevice;
    public initEnv: InitEnv;
    public queryPackage: QueryPackage;
    public logcat: Logcat;
    public clearAdb: ClearAdbLog;
    public adbZipPath?: string;
    public adbExtractPath?: string;
    public adbExePath?: string;
    public adbCwdPath?: string;


    public init() {
        immortal.mask(true);
        const menu = Menu.buildFromTemplate(this.template)
        Menu.setApplicationMenu(menu)

        this.initListener();
        this.initContext();
        this.initEnv.run();
        this.update();
        immortal.mask(false);
    }
    private initListener() {
        new ListenerPackageChange().listen(this);
    }
    public async update() {
        immortal.mask(true);
        await this.queryDevice.run();
        this.queryDevice.selectDefault()

        immortal.cmdToWebview(new DeviceList(this.devices, this.selectDevice));

        await this.queryPackage.run();
        this.queryPackage.selectDefault()

        immortal.logWebView(`选中包名: ${this.selectPackage}`);
        appLogger.log("this.packages: " + this.packages)
        immortal.cmdToWebview(new PackageList(this.packages, this.selectPackage));

        immortal.clearLog();
        await this.clearAdb.run();
        await this.logcat.run();
        immortal.mask(false);
    }
    private initContext() {
        this.adb = new Adb(this);
        this.queryDevice = new QueryDevice(this);
        this.initEnv = new InitEnv(this);
        this.queryPackage = new QueryPackage(this);
        this.logcat = new Logcat(this);
        this.clearAdb = new ClearAdbLog(this);
    }

    private async restartServer() {
        immortal.mask(true);
        immortal.clearLog();
        await this.destroy();
        await this.adb.run("kill-server")
        await this.adb.run("start-server")
        await this.update();
        immortal.mask(false);
    }
    public async destroy() {
        immortal.mask(true);
        await this.adb.destroy();
        await this.logcat.destroy();
        immortal.mask(false);
    }
}