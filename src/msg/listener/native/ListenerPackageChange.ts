import { ipcMain, IpcRendererEvent } from "electron";
import { AppContext } from "../../../logic/AppContext";
import { MsgObjChannel } from "../../../typings/define";
import { PackageChange } from "../../w2m/PackageChange";

export class ListenerPackageChange {
    private context: AppContext;
    public listen(context: AppContext) {
        this.context = context;
        ipcMain.on(MsgObjChannel.PackageChange, this.deviceListHandler.bind(this));
    }                       
    private deviceListHandler(evt: IpcRendererEvent, args: PackageChange) {
        if (args.value != this.context.selectPackage) {
            this.context.selectPackage = args.value;
            this.context.update();
        }
    }
}