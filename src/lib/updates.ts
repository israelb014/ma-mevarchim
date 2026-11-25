import { APP_VERSION, isAndroid, isElectron, isNative, REPO_API, SITE_URL } from './platform';

export const runOf = (v: string) => {
  const m = /^\d+\.\d+\.(\d+)$/.exec(v ?? '');
  return m ? Number(m[1]) : 0;
};

/** Native level of the installed APK: versionCode = level * 100000 + run number. */
async function installedAndroidLevel(): Promise<number> {
  const { App } = await import('@capacitor/app');
  const info = await App.getInfo();
  return Math.floor(Number(info.build) / 100000);
}

/**
 * Android live update (self-hosted, manual mode): download the newer web bundle in the
 * background and apply it on the next launch. Any failure keeps the current version.
 */
export async function nativeLiveUpdate(): Promise<void> {
  if (!isNative()) return;
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
    await CapacitorUpdater.notifyAppReady();
    if (navigator.onLine === false) return;
    const remote = await (await fetch(`${SITE_URL}app-version.json?t=${Date.now()}`, { cache: 'no-store' })).json();
    if (!remote?.version || runOf(remote.version) <= runOf(APP_VERSION)) return;
    if ((remote.androidLevel ?? 1) > (await installedAndroidLevel())) return; // needs a new APK – banner handles it
    const { bundles } = await CapacitorUpdater.list();
    let bundle = bundles.find((b) => b.version === remote.version && b.status !== 'error');
    if (!bundle) bundle = await CapacitorUpdater.download({ url: SITE_URL + (remote.bundle ?? 'bundle.zip'), version: remote.version });
    await CapacitorUpdater.next({ id: bundle.id });
  } catch {
    /* keep running the current version */
  }
}

export interface ShellUpdate {
  url: string;
  tag: string;
}

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

function levels(body: string) {
  const m = /levels:\s*android=(\d+)\s+desktop=(\d+)/.exec(body ?? '');
  return { android: m ? Number(m[1]) : 1, desktop: m ? Number(m[2]) : 1 };
}

/** Checks the latest GitHub release for a newer native shell (APK / desktop). */
export async function checkShellUpdate(): Promise<ShellUpdate | null> {
  const android = isNative() && isAndroid();
  const electron = isElectron();
  if (!android && !electron) return null;
  try {
    const rel = await (await fetch(REPO_API, { headers: { Accept: 'application/vnd.github+json' } })).json();
    const lv = levels(rel.body);
    const assets: ReleaseAsset[] = rel.assets ?? [];
    const find = (n: string) => assets.find((a) => a.name === n)?.browser_download_url;
    if (android) {
      if (lv.android > (await installedAndroidLevel())) {
        const url = find('ma-mevarchim.apk');
        return url ? { url, tag: rel.tag_name } : null;
      }
      return null;
    }
    const shell = window.maShell!;
    const myLevel = Number((shell as unknown as { level?: number }).level ?? 1);
    if (lv.desktop > myLevel) {
      const url = find(shell.platform === 'win32' ? 'ma-mevarchim.exe' : 'ma-mevarchim.AppImage');
      return url ? { url, tag: rel.tag_name } : null;
    }
    return null;
  } catch {
    return null;
  }
}
