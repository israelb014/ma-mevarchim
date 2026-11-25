const { contextBridge, ipcRenderer } = require('electron');

const arg = (name) => (process.argv.find((a) => a.startsWith(`--${name}=`)) || '').split('=')[1] || '';

contextBridge.exposeInMainWorld('maShell', {
  version: arg('ma-version'),
  level: Number(arg('ma-level') || 1),
  platform: process.platform,
  offline: !navigator.onLine,
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
