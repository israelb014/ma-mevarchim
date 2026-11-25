import { describe, expect, it } from 'vitest';
import { normalize, osa } from '../src/lib/normalize';
import { buildIndex, search } from '../src/lib/search';
import { bundledContent } from '../src/lib/content';

const c = bundledContent();
const idx = buildIndex(c.products);
const ids = (q: string) => search(idx, q).map((p) => p.id);

describe('normalize', () => {
  it('strips nikud, finals, spaces and hyphens', () => {
    expect(normalize('בָּמְבָּה')).toBe('במבה');
    expect(normalize('תפוחים')).toBe(normalize('תפוחימ'));
    expect(normalize('מיץ-תפוזים')).toBe(normalize('מיץ תפוזים'));
    expect(normalize("צ'יפס")).toBe('ציפס');
  });
  it('osa counts transpositions as one', () => {
    expect(osa('במבה', 'מבבה')).toBe(1);
    expect(osa('abc', 'abc')).toBe(0);
  });
});

describe('search', () => {
  it('finds by exact name first', () => {
    expect(ids('תפוז')[0]).toBe('orange');
    expect(ids('במבה')[0]).toBe('bamba');
  });
  it('ignores nikud and final letters', () => {
    expect(ids('בָּמְבָּה')[0]).toBe('bamba');
    expect(ids('תפוזימ')).toContain('orange-juice');
  });
  it('ignores spaces and hyphens', () => {
    expect(ids('מיץ-תפוזים')[0]).toBe('orange-juice');
    expect(ids('מיצתפוזים')[0]).toBe('orange-juice');
  });
  it('tolerates one typo', () => {
    expect(ids('במבע')).toContain('bamba');
    expect(ids('שוקולט')).toContain('milk-chocolate');
    expect(ids('פיצא')).toContain('pizza');
  });
  it('finds by synonym and brand', () => {
    expect(ids('קוקה קולה')).toContain('cola');
    expect(ids('אסם')).toEqual(expect.arrayContaining(['bamba', 'bissli']));
  });
  it('handles words in any order', () => {
    expect(ids('תפוזים מיץ')).toContain('orange-juice');
  });
  it('returns nothing for empty query', () => {
    expect(search(idx, '  ')).toEqual([]);
  });
});
