import { AppContext } from "./AppContext";

export abstract class Runner {
    constructor(public readonly context: AppContext) { }
    public abstract run(...args: any[]): Promise<any>
    public destroy(...args: any[]): Promise<any> { return Promise.resolve() };
}