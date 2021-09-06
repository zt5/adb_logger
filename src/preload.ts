import { ListenerDeviceList } from "./msg/listener/web/ListenerDeviceList";
import { ListenerLog } from "./msg/listener/web/ListenerLog";
import { ListenerMask } from "./msg/listener/web/ListenerMask";
import { ListenerPackageList } from "./msg/listener/web/ListenerPackageList";

window.addEventListener("DOMContentLoaded", () => {
  new ListenerDeviceList().listen();
  new ListenerLog().listen();
  new ListenerPackageList().listen();
  new ListenerMask().listen();
});