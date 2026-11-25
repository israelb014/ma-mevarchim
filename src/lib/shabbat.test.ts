import { describe, expect, it } from 'vitest';
import { lockState, upcomingEves, israelWallTime, sunset, chagOn } from './shabbat';

const at = (y: number, m: number, d: number, h: number, min = 0) => israelWallTime({ y, m, d }, h, min);

describe('shabbat lock', () => {
  // 2026-11-27 is a Friday; 2026-11-28 is Shabbat.
  it('is unlocked on Friday morning', () => {
    expect(lockState(at(2026, 11, 27, 10)).locked).toBe(false);
  });
  it('locks 40 minutes before sunset in Jerusalem on Friday', () => {
    const ss = sunset({ y: 2026, m: 11, d: 27 }, 'jerusalem');
    expect(lockState(new Date(ss.getTime() - 41 * 60000)).locked).toBe(false);
    const s = lockState(new Date(ss.getTime() - 39 * 60000));
    expect(s.locked).toBe(true);
    expect(s.kind).toBe('shabbat');
  });
  it('is locked on Shabbat afternoon', () => {
    expect(lockState(at(2026, 11, 28, 14)).locked).toBe(true);
  });
  it('unlocks 72 minutes after sunset in Tel Aviv on Saturday night', () => {
    const ss = sunset({ y: 2026, m: 11, d: 28 }, 'telaviv');
    expect(lockState(new Date(ss.getTime() + 71 * 60000)).locked).toBe(true);
    expect(lockState(new Date(ss.getTime() + 73 * 60000)).locked).toBe(false);
  });
  it('is unlocked on a regular weekday', () => {
    expect(lockState(at(2026, 11, 25, 20)).locked).toBe(false);
  });
  it('locks on Yom Tov (Shavuot 2027, Israel) as chag', () => {
    // Shavuot 5787 = 2027-06-11 (Friday) followed by Shabbat
    expect(chagOn({ y: 2027, m: 6, d: 11 })).toMatch(/Shavuot/);
    const s = lockState(at(2027, 6, 11, 12));
    expect(s.locked).toBe(true);
    expect(s.kind).toBe('both');
    expect(lockState(at(2027, 6, 12, 12)).locked).toBe(true);
  });
  it('locks for both days of Rosh Hashana', () => {
    // Rosh Hashana 5788: 2027-10-02 and 10-03
    expect(lockState(at(2027, 10, 2, 12)).locked).toBe(true);
    expect(lockState(at(2027, 10, 3, 12)).locked).toBe(true);
    expect(lockState(at(2027, 10, 4, 12)).locked).toBe(false);
  });
});

describe('upcoming eves', () => {
  it('lists Fridays at 10:00 Israel time', () => {
    const list = upcomingEves(at(2026, 11, 25, 9), 10);
    expect(list[0].date).toEqual({ y: 2026, m: 11, d: 27 });
    expect(list[0].event).toBe('leil-shabbat');
    expect(list[0].at.toISOString()).toBe('2026-11-27T08:00:00.000Z');
  });
  it('maps erev Pesach to the seder', () => {
    // Pesach 5787 starts on the evening of 2027-04-21
    const list = upcomingEves(at(2027, 4, 15, 9), 10);
    expect(list.find((e) => e.event === 'seder')?.date).toEqual({ y: 2027, m: 4, d: 21 });
  });
});
