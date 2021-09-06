import { Runner } from "../logic/Runner";

export class ClearAdbLog extends Runner {
    public async run() {
       await this.context.adb.run("logcat", "-c");
    }
}