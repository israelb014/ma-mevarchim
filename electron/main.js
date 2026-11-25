// Desktop shell: loads the live site, falls back to the bundled copy when offline.
const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const pkg = require('./package.json');
const path = require('node:path');

const SITE = 'https://israelb014.github.io/ma-mevarchim/';
const LOCAL = path.join(process.resourcesPath || __dirname, 'app', 'index.html');

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 860,
    minWidth: 360,
    backgroundColor: '#FBF6EC',
    title: 'מה מברכים',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      additionalArguments: [`--ma-version=${pkg.version}`, `--ma-level=${pkg.desktopLevel}`],
    },
  });
  Menu.setApplicationMenu(null);

  let fellBack = false;
  const loadLocal = () => {
    if (fellBack) return;
    fellBack = true;
    win.loadFile(LOCAL);
  };
  win.webContents.on('did-fail-load', (_e, code, _desc, url, isMainFrame) => {
    if (isMainFrame && code !== -3 && url.startsWith('http')) loadLocal();
  });
  const timer = setTimeout(() => {
    if (win.webContents.isLoading()) loadLocal();
  }, 12000);
  win.webContents.once('did-finish-load', () => clearTimeout(timer));

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(SITE) && !url.startsWith('file:')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadURL(SITE).catch(loadLocal);
}

ipcMain.on('open-external', (_e, url) => {
  if (/^https:\/\//.test(url)) shell.openExternal(url);
});
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
