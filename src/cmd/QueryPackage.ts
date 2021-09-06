import { Runner } from "../logic/Runner";
import { Package, PackageProgress } from "../msg/MsgStruct";

export class QueryPackage extends Runner {
    public async run() {
        this.context.packages = [];
        if (!this.context.selectDevice) return;


        this.parsePackage(await this.context.adb.run(
            "-s",
            this.context.selectDevice,
            "shell",
            "pm",
            "list",
            "packages",
            "-3"
        ));


        let progressArr: PackageProgress[] = this.parseProgress(await this.context.adb.run(
            "-s",
            this.context.selectDevice,
            "shell",
            "ps",
            "|",
            "grep",
            "-E",
            `"${this.context.packages.map(item => item.name).join("|")}"`,
            "|",
            "awk",
            "'{print $2,$9}'"
        ));

        for (let i = 0; i < this.context.packages.length; i++) {
            const curPackage = this.context.packages[i];
            curPackage.progress = progressArr.find(item => item.NAME == curPackage.name);
        }
    }
    private parseProgress(pidstr: string) {
        let progressArr: PackageProgress[] = [];
        if (pidstr) {
            let strs = pidstr.trim().split("\r\n").map(item => item.trim()).filter(item => item);
            if (strs.length) {
                for (let i = 0; i < strs.length; i++) {
                    const progressStr = strs[i].split(/\s+/).map(item => item.trim());
                    if (progressStr.length == 2) {
                        let progress = <PackageProgress>{};
                        progress.PID = +progressStr[0];
                        progress.NAME = progressStr[1];
                        progressArr.push(progress);
                    }
                }
            }
        }
        return progressArr;
    }
    public getPackageByName(name: string) {
        if (!this.context.packages) return undefined;
        return this.context.packages.find(item => item.name == name);
    }
    public selectDefault() {
        if (!this.context.selectPackage == null) {
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