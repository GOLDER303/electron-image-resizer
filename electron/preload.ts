import { contextBridge } from "electron";
import Toastify from "toastify-js";

import os from "os";
import path from "path";

const osApi = {
  homedir: () => os.homedir(),
};

const toastifyApi = {
  toast: (options: Toastify.Options) => Toastify(options).showToast(),
};

const pathApi = {
  join: path.join,
};

export const API = {
  os: osApi,
  path: pathApi,
  toastify: toastifyApi,
};

contextBridge.exposeInMainWorld("api", API);
