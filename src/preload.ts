// All of the Node.js APIs are available in the preload process.

import { WebListenerDeviceList } from "./web/listener/DeviceListListener";
import { WebListenerLog } from "./web/listener/LogListener";
import { WebListenerPackageList } from "./web/listener/WebListenerPackageList";


// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  new WebListenerDeviceList().listen();
  new WebListenerLog().listen();
  new WebListenerPackageList().listen();
});