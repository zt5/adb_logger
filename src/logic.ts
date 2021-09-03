import { app, BrowserWindow, Menu } from "electron"
import * as path from "path";
import * as fs from "fs";
import * as AdmZip from "adm-zip";
import * as cp from "child_process";
import * as iconv from "iconv-lite";
import { Device, DeviceState, MsgObj, Progress } from "./define";
import { ClearLog } from "./msg/m2w/ClearLog";
import { Log } from "./msg/m2w/Log";
import { DeviceList } from "./msg/m2w/DeviceList";
import { PackageList } from "./msg/m2w/PackageList";
import * as os from "os";

export class Logic {
    private window: BrowserWindow;
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
                this.restartServer().catch(err => {
                    this.logWebView(`${JSON.stringify(err)}`);
                })
            }
        }, {
            label: '获取设备列表',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
                this.cmdToWebview(new ClearLog())
                this.queryDevices().catch(err => {
                    this.logWebView(`${JSON.stringify(err)}`);
                })
            }
        }
    ];
    private adbZipPath: string;
    private adbExtractPath: string;
    private adbExePath: string;
    private adbCwdPath: string;

    private logWriteQueue: string[];
    private logFilePath: string;

    private devices: Device[];
    private packages: string[];
    private progress: Progress[];
    private selectDevice: string;
    private selectPackage: string;
    public init(window: BrowserWindow) {
        this.window = window;
        const menu = Menu.buildFromTemplate(this.template)
        Menu.setApplicationMenu(menu)
        this.logFilePath = this.pathResolve("log.txt");
        fs.writeFileSync(this.logFilePath, "", "utf-8");//清空内容
        this.logNative(`getAppPath: ${app.getAppPath()}`);

        const [adbZipName, adbExeName] = this.getADBZipName();
        if (!adbZipName) throw new Error("unsupport platform: " + os.platform());

        this.adbZipPath = this.pathResolve("/assets/adb/" + adbZipName);
        this.logNative(`adbZipPath: ${this.adbZipPath}`);
        this.adbExtractPath = this.pathResolve("/assets/adb");
        this.logNative(`adbExtracPath: ${this.adbExtractPath}`);


        this.adbExePath = this.pathResolve("/assets/adb/platform-tools/" + adbExeName);
        this.logNative(`adbExePath: ${this.adbExePath}`);
        this.adbCwdPath = this.pathResolve("/assets/adb/platform-tools");
        this.logNative(`adbCwdPath: ${this.adbCwdPath}`);

        this.devices = [];
        this.packages = [];
        this.progress = [];
    }
    private getADBZipName(): [string, string] {
        switch (os.platform()) {
            case "win32":
                return ["platform-tools_r31.0.3-windows.zip", "adb.exe"];
            case "darwin":
                return ["platform-tools_r31.0.3-darwin.zip", "adb"];
            case "linux":
                return ["platform-tools_r31.0.3-linux.zip", "adb"];
        }
    }
    private pathResolve(url: string) {
        if (app.isPackaged) {
            return path.join(app.getAppPath(), url);
        } else {
            return path.resolve(path.join(app.getAppPath(), "../", url));
        }
    }
    private logNative(str: string) {
        if (!this.logWriteQueue) {
            this.logWriteQueue = [];
            let isWrite = false;
            setInterval(() => {
                if (isWrite) return;
                if (this.logWriteQueue.length) {
                    isWrite = true;
                    let str = this.logWriteQueue.shift();
                    fs.writeFile(this.logFilePath, str + "\n", { encoding: "utf-8", flag: "a" }, () => {
                        isWrite = false;
                    })
                }
            }, 100);
        }
        console.log(str);
        this.logWriteQueue.push(str);
    }
    private cmdToWebview(msg: MsgObj) {
        console.log(JSON.stringify(msg));
        if (this.window.isDestroyed()) return;
        this.window.webContents.send(msg.channel, msg);
    }
    private logWebView(msg: string | string[]) {
        if (Array.isArray(msg)) {
            this.cmdToWebview(new Log(msg));
        }
        else if (typeof msg == "string") {
            this.cmdToWebview(new Log(`${msg}\n`));
        }
    }

    private async restartServer() {
        this.cmdToWebview(new ClearLog())
        await this.execAdb("kill-server")
        await this.execAdb("start-server")
    }
    private async queryDevices() {
        this.devices = [];
        this.parseDevice(await this.execAdb("devices"));
        this.selectDefaultDevice();
        this.cmdToWebview(new DeviceList(this.devices, this.selectDevice));
        this.logWebView(`选中设备名: ${this.selectDevice}`);
        this.watchProgress(this.adbExePath, ["logcat", "-v "], this.adbCwdPath, value => {
            this.logWebView(value.split("\r\n"));
        });
        await this.queryPackages();
        await this.queryProgress();
    }
    private async queryProgress() {
        this.progress = [];
        for (let i = 0; i < this.packages.length; i++) {
            this.parseProgress(await this.execAdb("-s", this.selectDevice, "shell", "ps", `|grep ${this.packages[i]}`), this.packages[i]);
        }
        let progress = this.progress.find(item => item.NAME == this.selectDevice);
        if (progress) {
            this.logWebView(`选中进程: ${progress}`);
        } else {
            this.logWebView(`选中进程: 未运行`);
        }
    }
    private parseProgress(pidstr: string, packageName: string) {
        if (pidstr) {
            let strs = pidstr.trim().split("\r\n").map(item => item.trim()).filter(item => item);
            console.log(strs);
            if (strs.length) {
                for (let i = 0; i < strs.length; i++) {
                    const progressStr = strs[i].split(/\s+/).map(item => item.trim());
                    if (progressStr.length) {
                        let progress = <Progress>{};
                        progress.USER = progressStr[0];
                        progress.PID = +progressStr[1];
                        progress.PPID = +progressStr[2];
                        progress.VSIZE = +progressStr[3];
                        progress.RSS = +progressStr[4];
                        progress.WCHAN = progressStr[5];
                        progress.PC = progressStr[6];
                        progress.NAME_PROGRESS = progressStr[7];
                        progress.NAME = progressStr[8];
                        if (progress.NAME == packageName) {
                            this.progress.push(progress);
                            return;
                        }
                    }
                }
            }
        }
        this.progress.push(null);
    }

    private selectDefaultDevice() {
        if (this.selectDevice == null) {
            if (this.devices.length) {
                this.selectDevice = this.devices[0].serialNumber;
            }
        } else {
            let finded = false;
            for (let i = 0; i < this.devices.length; i++) {
                if (this.devices[i].serialNumber == this.selectDevice) {
                    finded = true;
                    break;
                }
            }
            if (!finded) this.selectDevice = null;
        }
    }
    private selectDefaultPackage() {
        if (this.selectPackage == null) {
            if (this.packages.length) {
                this.selectPackage = this.packages[0];
            }
        } else {
            if (this.packages.indexOf(this.selectPackage) == -1) this.selectPackage = null;
        }
    }
    private async queryPackages() {
        this.packages = [];
        this.parsePackage(await this.execAdb("-s", this.selectDevice, "shell", "pm", "list", "packages", "-3"));
        this.selectDefaultPackage();
        this.cmdToWebview(new PackageList(this.packages, this.selectDevice));
        this.logWebView(`选中包名: ${this.selectPackage}`);
    }
    private parsePackage(queryPackages: string) {
        this.packages = queryPackages.split("\r\n").map(item => item.trim().split(":")[1]).filter(item => item);
    }
    private parseDevice(queryDevices: string) {
        const logs = queryDevices.split("\r\n")
            .map(item => item.trim())
            .filter(item => item && item != "List of devices attached");
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i].split("\t").filter(item => item);
            const serialNumber = log[0];
            const state = <DeviceState>log[1];
            this.devices.push({ serialNumber, state })
        }
    }

    private checkAdb() {
        return new Promise<void>((resolve, reject) => {
            if (fs.existsSync(this.adbExePath)) {
                resolve();
            } else {
                var zip = new AdmZip(this.adbZipPath);
                zip.extractAllToAsync(this.adbExtractPath, true, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    }
    private async execAdb(...cmd: string[]) {
        await this.checkAdb();
        return await this.onceProgress(this.adbExePath, cmd, this.adbCwdPath);
    }
    private onceProgress(cmd: string, params: string[], cwd: string) {
        return new Promise<string>(resolve => {
            let str = "";
            const progress = cp.spawn(cmd, params, { cwd });
            if (progress.stdout) {
                progress.stdout.on('data', (data) => {
                    const msg = iconv.decode(Buffer.from(data, "binary"), "gbk");
                    str += msg;
                });
            }
            if (progress.stderr) {
                progress.stderr.on('data', (data) => {
                    const msg = iconv.decode(Buffer.from(data, "binary"), "gbk");
                    str += msg;
                });
            }
            progress.on('exit', (code) => {
                resolve(str);
            });
        })
    }
    private watchProgress(cmd: string, params: string[], cwd: string, progressFun?: (value: string) => void) {
        return new Promise<void>(resolve => {
            const progress = cp.spawn(cmd, params, { cwd });
            if (progress.stdout) {
                progress.stdout.on('data', (data) => {
                    const msg = iconv.decode(Buffer.from(data, "binary"), "gbk");
                    if (progressFun) progressFun(msg);
                });
            }
            if (progress.stderr) {
                progress.stderr.on('data', (data) => {
                    const msg = iconv.decode(Buffer.from(data, "binary"), "gbk");
                    if (progressFun) progressFun(msg);
                });
            }
            progress.on('exit', (code) => {
                resolve();
            });
        })
    }
}