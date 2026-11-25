import { Capacitor } from '@capacitor/core';

export const SITE_URL = 'https://israelb014.github.io/ma-mevarchim/';
export const REPO_API = 'https://api.github.com/repos/israelb014/ma-mevarchim/releases/latest';
export const APP_VERSION: string = __APP_VERSION__;
export const BUILD_DATE: string = __BUILD_DATE__;
export const WHATSAPP = '972545454981';

declare global {
  interface Window {
    maShell?: { version: string; platform: string; offline: boolean; openExternal: (url: string) => void };
  }
}

export const isNative = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isElectron = () => typeof window !== 'undefined' && !!window.maShell;

/** Base URL for fetching fresh content: same origin on the web, the Pages site elsewhere. */
export function remoteBase(): string {
  if (typeof location !== 'undefined' && location.protocol.startsWith('http') && !isNative()) {
    return new URL('.', location.href).toString();
  }
  return SITE_URL;
}

export function openExternal(url: string) {
  if (isElectron()) return window.maShell!.openExternal(url);
  if (isNative()) {
    import('@capacitor/app-launcher').then(({ AppLauncher }) => AppLauncher.openUrl({ url }));
    return;
  }
  window.open(url, '_blank', 'noopener');
}

export function whatsappUrl(text: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
