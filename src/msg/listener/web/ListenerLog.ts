import { ipcRenderer, IpcRendererEvent } from "electron";
import { InitPage, MsgObjChannel } from "../../../typings/define";
import { ClearLog } from "../../m2w/ClearLog";
import { Log } from "../../m2w/Log";
export class ListenerLog {
    private isPress: boolean;
    private isLockEnd: boolean;
    private log: HTMLDivElement;
    private page: HTMLSelectElement;
    private msgs: string[];
    private divs: HTMLDivElement[];
    private readonly ONE_PAGE_NUM = 200;
    private curSelPageIndex: number;
    public listen() {
        this.log = <HTMLDivElement>document.querySelector("#DivLog");
        this.page = <HTMLSelectElement>document.querySelector("#SelectPage");

        this.isPress = false;
        this.isLockEnd = true;
        this.msgs = [];
        this.divs = [];
        this.curSelPageIndex = -1;
        this.setList(InitPage);

        let root: DocumentFragment = document.createDocumentFragment();
        for (let i = 0; i < this.ONE_PAGE_NUM; i++) {
            let div = document.createElement("div");
            div.innerText = "";
            div.classList.add("logItem");
            root.appendChild(div);
            this.divs.push(div);
        }
        this.log.appendChild(root);


        ipcRenderer.on(MsgObjChannel.Log, this.logHandler.bind(this))
        document.onmousedown = this.mouseDownHandler.bind(this);
        document.onmouseup = this.mouseUpHandler.bind(this);
        document.onmousewheel = this.mouseWhellHandler.bind(this);
        ipcRenderer.on(MsgObjChannel.ClearLog, this.clearLogHandler.bind(this))
        this.page.addEventListener("change", this.onSelectChange.bind(this))
    }
    private setList(maxPageNum: number) {
        this.page.options.length = 0;
        for (let i = 0; i <= maxPageNum; i++) {
            let option = <HTMLOptionElement>document.createElement("option");
            option.innerText = `第${i + 1}页`
            option.value = `${i}`;
            this.page.appendChild(option);
        }
    }
    private pageIsSelectLast() {
        return this.page.options.length == this.page.selectedIndex + 1;
    }
    private onSelectChange() {
        const selValue = +this.page.options[this.page.selectedIndex].value;
        if (this.curSelPageIndex == -1) {
            //上次没选中 默认状态
            if (this.pageIsSelectLast()) {
                //本次选中最后一个和没选中效果一样
            } else {
                //本次选中了历史记录
                this.curSelPageIndex = selValue;
                this.updateItem(selValue);
                //恢复滚动的位置
                this.log.scrollTop = 0;
            }
        } else if (this.curSelPageIndex != selValue) {
            //上次选中了历史记录
            if (this.pageIsSelectLast()) {
                //本次选中最后一个恢复默认状态
                this.curSelPageIndex = -1;
            } else {
                //本次选中了历史记录
                this.curSelPageIndex = selValue;
                //恢复滚动的位置
                this.log.scrollTop = 0;
            }
            this.updateItem(selValue);
        }
    }
    private mouseWhellHandler(ev: MouseEvent) {
        //查看历史记录时跳过判断是否锁定末尾
        if (this.curSelPageIndex != -1) return;
        this.isLockEnd = this.log.scrollTop + this.log.clientHeight + 20 >= this.log.scrollHeight;
    }
    private mouseUpHandler(ev: MouseEvent) {
        //查看历史记录时跳过判断是否锁定末尾
        if (this.curSelPageIndex != -1) return;
        if (this.isPress) {
            this.isPress = false;
            this.isLockEnd = this.log.scrollTop + this.log.clientHeight + 20 >= this.log.scrollHeight;
        }
    }
    private mouseDownHandler(ev: MouseEvent) {
        //查看历史记录时跳过判断是否锁定末尾
        if (this.curSelPageIndex != -1) return;
        this.isPress = ev.target == this.log;
    }
    private clearLogHandler(evt: IpcRendererEvent, args: ClearLog) {
        for (let i = 0; i < this.ONE_PAGE_NUM; i++) {
            this.divs[i].innerText = "";
        }
        this.msgs.splice(0, this.msgs.length);
        this.page.scrollTop = 0;
        this.curSelPageIndex = -1;
    }
    private logHandler(evt: IpcRendererEvent, args: Log) {
        let msgs = Array.isArray(args.content) ? args.content : [args.content];
        msgs = msgs.filter(item => item.trim() != "");
        if (msgs.length == 0) return;
        this.msgs.push(...msgs);
        const pageIndex = Math.floor(this.msgs.length / this.ONE_PAGE_NUM);
        if (pageIndex + 1 > this.page.options.length) {//判断选择器是否需要新增
            this.setList(pageIndex);
        }
        if (this.curSelPageIndex == -1) {
            this.page.selectedIndex = pageIndex;
            this.updateItem(pageIndex);
        } else {
            this.page.selectedIndex = this.curSelPageIndex;
        }
    }
    private updateItem(startPageIndex: number) {
        startPageIndex *= this.ONE_PAGE_NUM
        for (let i = 0; i < this.ONE_PAGE_NUM; i++) {
            const msg = this.msgs[i + startPageIndex]
            if (msg) {
                this.divs[i].innerText = msg;
            } else {
                this.divs[i].innerText = "";
            }
        }
        if (!this.isPress && (this.curSelPageIndex == -1 || this.pageIsSelectLast()) && this.isLockEnd) {
            this.log.scrollTop = this.log.scrollHeight
        }
    }
}