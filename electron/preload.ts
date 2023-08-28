import { contextBridge } from "electron";

import os from "os";
import path from "path";

const osApi = {
  homedir: () => os.homedir(),
};

const pathApi = {
  join: path.join,
};

export const API = {
  osApi,
  pathApi,
};

contextBridge.exposeInMainWorld("api", API);
