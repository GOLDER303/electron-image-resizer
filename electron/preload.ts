import { contextBridge, ipcRenderer } from "electron";
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

const ipcRendererApi = {
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) =>
    ipcRenderer.on(channel, callback),
};

export const API = {
  os: osApi,
  path: pathApi,
  toastify: toastifyApi,
  ipcRenderer: ipcRendererApi,
};

contextBridge.exposeInMainWorld("api", API);
