import { IO } from "../msg/IO";
import { AppContext } from "./AppContext";

export abstract class ActionBase {
    constructor(public readonly context: AppContext, public readonly io: IO) {
    }
    public async destroy() {
    }
}