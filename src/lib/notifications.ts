import { isNative } from './platform';
import { upcomingEves } from './shabbat';
import { go } from './router';

const BASE_ID = 7000;

/** Android: local notifications at 10:00 on Fridays and holiday eves. */
export async function setupNotifications(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    LocalNotifications.addListener('localNotificationActionPerformed', (a) => {
      const ev = a.notification.extra?.event ?? 'leil-shabbat';
      go(`shabbat?event=${ev}`);
    });
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter((n) => n.id >= BASE_ID && n.id < BASE_ID + 1000);
    if (ours.length) await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) });
    const eves = upcomingEves(new Date(), 70);
    await LocalNotifications.schedule({
      notifications: eves.map((e, i) => ({
        id: BASE_ID + i,
        title: 'מה מברכים',
        body: e.event === 'leil-shabbat' && new Date(Date.UTC(e.date.y, e.date.m - 1, e.date.d)).getUTCDay() === 5 ? 'דף הברכות לשבת מוכן להדפסה' : 'דף הברכות לחג מוכן להדפסה',
        schedule: { at: e.at, allowWhileIdle: true },
        extra: { event: e.event },
      })),
    });
  } catch {
    /* notifications are optional */
  }
}
