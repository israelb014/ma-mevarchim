import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildQuiz } from '../src/lib/quiz';
import { bundledContent, resolveFor } from '../src/lib/content';

const read = (n: string) => JSON.parse(readFileSync(`public/data/${n}.json`, 'utf8'));
const rules = read('rules');
const products = read('products');
const events = read('events');
const extra = read('extra-blessings');
const version = read('data-version');
const FIRST = Object.keys(rules.blessings.first);
const LAST = Object.keys(rules.blessings.last);
const ruleIds = new Set(rules.rules.map((r: { id: string }) => r.id));
const NIKUD = /[ְ-ּ]/;

describe('data files', () => {
  it('data-version has a version and a date', () => {
    expect(version.version).toBeGreaterThan(0);
    expect(version.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('has at least 14 rules, each with explanation, examples, source and quiz', () => {
    expect(rules.rules.length).toBeGreaterThanOrEqual(14);
    for (const r of rules.rules) {
      expect(r.explanation.length, r.id).toBeGreaterThan(20);
      expect(r.examples.length, r.id).toBeGreaterThan(0);
      expect(r.source, r.id).toMatch(/סימן/);
      expect(r.quiz.length, r.id).toBeGreaterThanOrEqual(3);
      for (const q of r.quiz) expect(q.answer).toBeLessThan(q.options.length);
      expect(FIRST).toContain(r.blessing);
    }
  });
  it('has at least 300 products', () => {
    expect(products.products.length).toBeGreaterThanOrEqual(300);
  });
  it('every product is complete and points to an existing rule', () => {
    const ids = new Set<string>();
    for (const p of products.products) {
      expect(ids.has(p.id), `dup ${p.id}`).toBe(false);
      ids.add(p.id);
      expect(p.name).toBeTruthy();
      expect(Array.isArray(p.synonyms)).toBe(true);
      expect(products.categories[p.category], p.id).toBeTruthy();
      expect(FIRST, p.id).toContain(p.first);
      expect(LAST, p.id).toContain(p.last);
      expect(ruleIds.has(p.rule_id), `${p.id} → ${p.rule_id}`).toBe(true);
      expect(p.why, p.id).toBeTruthy();
      expect(p.source, p.id).toMatch(/סימן/);
      expect(typeof p.doubt).toBe('boolean');
      if (p.nusach_diff) {
        expect(p.nusach_diff.text, p.id).toBeTruthy();
        const a = p.nusach_diff.ashkenaz;
        if (a?.first) expect(FIRST).toContain(a.first);
        if (a?.last) expect(LAST).toContain(a.last);
      }
    }
  });
  it('seven species fruits end with al haetz, grains with al hamichya', () => {
    for (const id of ['grapes', 'figs', 'pomegranate', 'dates', 'olives', 'raisins']) {
      expect(products.products.find((p: { id: string }) => p.id === id).last).toBe('etz');
    }
    for (const p of products.products.filter((p: { rule_id: string }) => p.rule_id === 'rice')) {
      expect(p.last, p.id).toBe('nefashot');
    }
  });
  it('blessing texts are written with nikud', () => {
    expect(rules.blessings.prefix).toMatch(NIKUD);
    for (const k of FIRST) expect(rules.blessings.first[k].ending).toMatch(NIKUD);
    for (const b of extra.blessings) expect(b.text, b.id).toMatch(NIKUD);
  });
  it('events cover all seven occasions for both nusachim', () => {
    const want = ['leil-shabbat', 'yom-shabbat', 'seuda-shlishit', 'seder', 'rosh-hashana', 'sukkot', 'tu-bishvat'];
    expect(events.events.map((e: { id: string }) => e.id)).toEqual(want);
    for (const e of events.events) {
      for (const n of ['sefaradi', 'ashkenaz']) {
        expect(e.steps[n].length, `${e.id}/${n}`).toBeGreaterThan(2);
        for (const s of e.steps[n]) {
          if (s.blessing) expect(FIRST).toContain(s.blessing);
          if (s.text) expect(s.text).toMatch(NIKUD);
        }
      }
    }
  });
});

describe('nusach and quiz', () => {
  const c = bundledContent();
  it('applies ashkenazi overrides', () => {
    const matzah = c.products.find((p) => p.id === 'matzah')!;
    expect(resolveFor(matzah, 'sefaradi').first).toBe('mezonot');
    expect(resolveFor(matzah, 'ashkenaz').first).toBe('hamotzi');
  });
  it('builds a 5-question quiz preferring my products', () => {
    const qs = buildQuiz(c, 'sefaradi', ['apple', 'bamba'], {}, 5);
    expect(qs).toHaveLength(5);
    expect(qs.some((q) => q.productId === 'apple')).toBe(true);
    expect(qs.some((q) => q.productId === 'bamba')).toBe(false); // doubtful items are skipped
    for (const q of qs) expect(q.answer).toBeGreaterThanOrEqual(0);
  });
});
