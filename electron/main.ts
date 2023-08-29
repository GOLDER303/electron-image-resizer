import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from "electron";
import fs from "fs";
import gm from "gm";
import path from "node:path";
import os from "os";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let mainWindow: BrowserWindow | null;
let aboutWindow: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Test active push message to Renderer-process.
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(path.join(VITE_DEV_SERVER_URL, "renderer/index.html"));
  } else {
    // win.loadFile('dist/index.html')
    mainWindow.loadFile(path.join(process.env.DIST, "renderer/index.html"));
  }
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.webContents.on("did-finish-load", () => {
    aboutWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  if (VITE_DEV_SERVER_URL) {
    aboutWindow.loadURL(path.join(VITE_DEV_SERVER_URL, "renderer/about.html"));
  } else {
    // win.loadFile('dist/index.html')
    aboutWindow.loadFile(path.join(process.env.DIST, "renderer/about.html"));
  }
}

app.on("window-all-closed", () => {
  mainWindow = null;
});

const mainMenuTemplate: MenuItemConstructorOptions[] = [
  {
    role: "fileMenu",
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
        click: createAboutWindow,
      },
    ],
  },
];

app.whenReady().then(() => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

const resizeImage = (
  imgPath: string,
  width: number,
  height: number,
  destination: string
) => {
  const filename = path.basename(imgPath);

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const destinationFile = path.join(destination, filename);

  gm(imgPath)
    .resize(+width, +height, "!")
    .write(destinationFile, (err) => {
      if (err) {
        console.error(err);
      } else {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send("image:done");
        }

        shell.openPath(destination);
      }
    });
};

ipcMain.on(
  "image:resize",
  (_, options: { imgPath: string; width: number; height: number }) => {
    const destination = path.join(os.homedir(), "image_resizer");
    resizeImage(options.imgPath, options.width, options.height, destination);
  }
);
