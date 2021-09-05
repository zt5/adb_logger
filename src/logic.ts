import { Menu } from "electron";
import { ActionAdbCmd } from "./action/ActionAdbCmd";
import { ActionAdbLog } from "./action/ActionAdbLog";
import { ActionDeviceWatch } from "./action/ActionDeviceWatch";
import { ActionInitAdb } from "./action/ActionInitAdb";
import { ActionQueryDevice } from "./action/ActionQueryDevice";
import { ActionQueryPackage } from "./action/ActionQueryPackage";
import { ActionQueryProgress } from "./action/ActionQueryProgress";
import { AppContext } from "./action/AppContext";
import { appLogger } from "./main";
import { IO } from "./msg/IO";
import { ClearLog } from "./msg/m2w/ClearLog";
import { DeviceList } from "./msg/m2w/DeviceList";
import { PackageList } from "./msg/m2w/PackageList";

export class Logic {
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
                    this.io.logWebView(`重启完成`);
                }).catch(err => {
                    this.io.logWebView(`${JSON.stringify(err)}`);
                })
            }
        }, {
            label: '清空日志',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
                this.io.cmdToWebview(new ClearLog())
            }
        }
    ];
    private context: AppContext;
    private io: IO;
    private tickerId: NodeJS.Timer;
    public init() {
        const menu = Menu.buildFromTemplate(this.template)
        Menu.setApplicationMenu(menu)

        this.context = new AppContext();
        this.io = new IO();
        this.initActs();
        this.context.actInitAdb.exec();
        this.startTick();
    }
    private startTick() {
        this.tickerId = setInterval(this.ticker.bind(this), 1000);
        this.ticker();
    }
    private async ticker() {
        const { selectDevice, selectPackage, actQueryDevice, actQueryPackage } = this.context;

        await actQueryDevice.query();

        const prevSelectDevice = this.context.selectDevice;
        const prevDevice = actQueryDevice.getDeviceByName(prevSelectDevice);

        actQueryDevice.selectDefaultDevice()

        let deviceIsChange = this.context.selectDevice != prevSelectDevice;
        if (!deviceIsChange) {
            const newDevice = actQueryDevice.getDeviceByName(prevSelectDevice);
            deviceIsChange = JSON.stringify(prevDevice) != JSON.stringify(newDevice);
        }
        if (deviceIsChange) {
            if (this.context.selectDevice) {
                appLogger.log(`选中设备名: ${this.context.selectDevice}`);
            } else {
                appLogger.log(`未连接设备`);
            }
            this.io.cmdToWebview(new DeviceList(this.context.devices, this.context.selectDevice));
        }

        await actQueryPackage.query();
        actQueryPackage.selectDefaultPackage()

        const prevSelectPackage = this.context.selectPackage;
        const prevPackage = actQueryPackage.getPackageByName(prevSelectPackage);

        let packageIsChange = prevSelectPackage != this.context.selectPackage;
        if (!packageIsChange) {
            let newPackage = actQueryPackage.getPackageByName(prevSelectPackage);
            packageIsChange = JSON.stringify(newPackage) != JSON.stringify(prevPackage);
        }
        if (packageIsChange) {
            this.io.logWebView(`选中包名: ${this.context.selectPackage}`);
            this.io.cmdToWebview(new PackageList(this.context.packages, this.context.selectDevice));
        }
        if (deviceIsChange || packageIsChange) {
            this.context.actLogListen.listen();
        }
    }
    private initActs() {
        const claz: [keyof AppContext, any][] = [
            ["actInitAdb", ActionInitAdb],
            ["actAdbCmd", ActionAdbCmd],
            ["actQueryPackage", ActionQueryPackage],
            ["actQueryDevice", ActionQueryDevice],
            ["actQueryProgress", ActionQueryProgress],
            ["actLogListen", ActionAdbLog],
        ]
        for (let i = 0; i < claz.length; i++) {
            const Claz = claz[i][1];
            this.context[claz[i][0]] = new Claz(this.context, this.io);
        }
    }

    private async restartServer() {
        this.io.cmdToWebview(new ClearLog())
        await this.destroy();

        await this.context.actAdbCmd.exec("kill-server")
        await this.context.actAdbCmd.exec("start-server")
        this.startTick();
    }
    public async destroy() {
        if (this.tickerId) clearInterval(this.tickerId);
        //清理
        await this.context.actAdbCmd.destroy();
        await this.context.actLogListen.destroy();
    }
}