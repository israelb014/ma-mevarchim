import { GeoLocation, HDate, HebrewCalendar, Zmanim, flags } from '@hebcal/core';

const JERUSALEM = new GeoLocation('Jerusalem', 31.778, 35.2354, 0, 'Asia/Jerusalem');
const TEL_AVIV = new GeoLocation('Tel Aviv', 32.0853, 34.7818, 0, 'Asia/Jerusalem');
const TZ = 'Asia/Jerusalem';
const MIN = 60_000;

export interface YMD {
  y: number;
  m: number; // 1-12
  d: number;
}

/** Calendar date in Israel for an absolute moment. */
export function israelDate(t: Date): YMD {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(t);
  const g = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return { y: g('year'), m: g('month'), d: g('day') };
}

export function addDays(a: YMD, n: number): YMD {
  const dt = new Date(Date.UTC(a.y, a.m - 1, a.d + n));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

const localDate = (a: YMD) => new Date(a.y, a.m - 1, a.d, 12);
const weekday = (a: YMD) => new Date(Date.UTC(a.y, a.m - 1, a.d)).getUTCDay();

export function holidaysOn(a: YMD) {
  return HebrewCalendar.getHolidaysOnDate(new HDate(localDate(a)), true) ?? [];
}

/** Yom Tov (work-prohibited holiday) in Israel. */
export function chagOn(a: YMD): string | null {
  const ev = holidaysOn(a).find((e) => e.getFlags() & flags.CHAG);
  return ev ? ev.getDesc() : null;
}

export const isShabbat = (a: YMD) => weekday(a) === 6;
export const isRestricted = (a: YMD) => isShabbat(a) || !!chagOn(a);

export function sunset(a: YMD, where: 'jerusalem' | 'telaviv'): Date {
  const z = new Zmanim(where === 'jerusalem' ? JERUSALEM : TEL_AVIV, localDate(a), false);
  return z.sunset();
}

export type LockKind = 'shabbat' | 'chag' | 'both';
export interface LockState {
  locked: boolean;
  kind?: LockKind;
  until?: Date;
}

/**
 * Locked from 40 minutes before sunset in Jerusalem on the eve of Shabbat / Yom Tov
 * until 72 minutes after sunset in Tel Aviv at its end (Israel calendar).
 */
export function lockState(now: Date): LockState {
  const today = israelDate(now);
  for (const off of [-1, 0, 1]) {
    const day = addDays(today, off);
    if (!isRestricted(day)) continue;
    const start = sunset(addDays(day, -1), 'jerusalem').getTime() - 40 * MIN;
    const end = sunset(day, 'telaviv').getTime() + 72 * MIN;
    if (now.getTime() >= start && now.getTime() < end) {
      // extend through consecutive restricted days
      let last = day;
      while (isRestricted(addDays(last, 1))) last = addDays(last, 1);
      let chag = false;
      let shabbat = false;
      for (let d = day; ; d = addDays(d, 1)) {
        if (chagOn(d)) chag = true;
        if (isShabbat(d)) shabbat = true;
        if (d.y === last.y && d.m === last.m && d.d === last.d) break;
      }
      const kind: LockKind = chag && shabbat ? 'both' : chag ? 'chag' : 'shabbat';
      return { locked: true, kind, until: new Date(sunset(last, 'telaviv').getTime() + 72 * MIN) };
    }
  }
  return { locked: false };
}

/** Converts Israel wall-clock time to an absolute Date. */
export function israelWallTime(a: YMD, hour: number, minute = 0): Date {
  const guess = Date.UTC(a.y, a.m - 1, a.d, hour, minute);
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  const p = fmt.formatToParts(new Date(guess));
  const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
  const asIsrael = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
  return new Date(guess - (asIsrael - guess));
}

/** Which printable event fits the meal that starts at the end of `erev`. */
export function eventForEve(erev: YMD): string | null {
  const next = addDays(erev, 1);
  const chag = chagOn(next);
  if (chag) {
    if (chag.startsWith('Yom Kippur')) return null;
    if (chag.startsWith('Rosh Hashana')) return 'rosh-hashana';
    if (chag === 'Pesach I') return 'seder';
    if (chag === 'Sukkot I') return 'sukkot';
    return 'leil-shabbat';
  }
  return isShabbat(next) ? 'leil-shabbat' : null;
}

/** Fridays and holiday eves (that are not themselves restricted) in the next `days` days. */
export function upcomingEves(from: Date, days = 60): { date: YMD; event: string; at: Date }[] {
  const out: { date: YMD; event: string; at: Date }[] = [];
  const start = israelDate(from);
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    if (isRestricted(d)) continue;
    const event = eventForEve(d);
    if (!event) continue;
    const at = israelWallTime(d, 10, 0);
    if (at.getTime() > from.getTime()) out.push({ date: d, event, at });
  }
  return out;
}

/** Default event to show on the Shabbat & Holidays screen. */
export function suggestedEvent(now: Date): string {
  const today = israelDate(now);
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, i);
    if (isRestricted(d)) continue;
    const e = eventForEve(d);
    if (e) return e;
  }
  const hol = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => holidaysOn(addDays(today, i)).map((e) => e.getDesc())).flat();
  if (hol.some((h) => h.startsWith("Tu BiShvat"))) return 'tu-bishvat';
  return 'leil-shabbat';
}
