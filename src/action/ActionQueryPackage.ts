import { Package, Progress } from "../typings/define";
import { ActionBase } from "./ActionBase";

export class ActionQueryPackage extends ActionBase {
    public async query() {
        this.context.packages = [];
        const { context } = this;
        const { actAdbCmd } = context;
        
        if (!context.selectDevice) return;

        this.parsePackage(await actAdbCmd.exec(
            "-s",
            context.selectDevice,
            "shell",
            "pm",
            "list",
            "packages",
            "-3"
        ));
        for (let i = 0; i < context.packages.length; i++) {
            const curPackage = context.packages[i];
            curPackage.progress = this.parseProgress(await actAdbCmd.exec(
                "-s",
                context.selectDevice,
                "shell",
                "ps",
                `|grep ${curPackage.name}`,
                "|awk '{print $2,$9}'"
            ), curPackage.name);
        }
    }
    private parseProgress(pidstr: string, packageName: string) {
        if (pidstr) {
            let strs = pidstr.trim().split("\r\n").map(item => item.trim()).filter(item => item);
            if (strs.length) {
                for (let i = 0; i < strs.length; i++) {
                    const progressStr = strs[i].split(/\s+/).map(item => item.trim());
                    if (progressStr.length) {
                        let progress = <Progress>{};
                        progress.PID = +progressStr[0];
                        progress.NAME = progressStr[1];
                        if (progress.NAME == packageName) {
                            return progress;
                        }
                    }
                }
            }
        }
        return null;
    }
    public getPackageByName(name: string) {
        return this.context.packages.find(item => item.name == name);
    }
    public selectDefaultPackage() {

        if (this.context.selectPackage == null) {
            if (this.context.packages.length) {
                this.context.selectPackage = this.context.packages[0].name;
            }
        } else {
            let hasPrevPackage = false;
            for (let i = 0; i < this.context.packages.length; i++) {
                if (this.context.packages[i].name == this.context.selectPackage) {
                    hasPrevPackage = true;
                    break;
                }
            }
            if (!hasPrevPackage) this.context.selectPackage = null;
        }
    }
    private parsePackage(queryPackages: string) {
        this.context.packages = queryPackages
            .split("\r\n")
            .map(item => item.trim().split(":")[1])
            .filter(item => item)
            .sort()
            .map(item => (<Package>{ name: item }));
    }
}