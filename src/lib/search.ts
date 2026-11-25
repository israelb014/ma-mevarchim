import { normalize, osa, words } from './normalize';
import type { Product } from './types';

interface Entry {
  p: Product;
  keys: { k: string; w: number }[];
}

export interface SearchIndex {
  entries: Entry[];
}

export function buildIndex(products: Product[]): SearchIndex {
  return {
    entries: products.map((p) => ({
      p,
      keys: [
        { k: normalize(p.name), w: 6 },
        ...p.synonyms.map((s) => ({ k: normalize(s), w: 3 })),
        ...(p.brand ? [{ k: normalize(p.brand), w: 0 }] : []),
      ].filter((x) => x.k),
    })),
  };
}

/** Is there a window in `key` within edit distance 1 of q? */
function fuzzyContains(key: string, q: string): boolean {
  if (osa(q, key, 1) <= 1) return true;
  for (let len = q.length - 1; len <= q.length + 1; len++) {
    if (len < 2 || len > key.length) continue;
    for (let i = 0; i + len <= key.length; i++) {
      if (osa(q, key.slice(i, i + len), 1) <= 1) return true;
    }
  }
  return false;
}

function scoreKey(key: string, q: string): number {
  if (key === q) return 100;
  if (key.startsWith(q)) return 80;
  if (key.includes(q)) return 60;
  if (q.length >= 3 && fuzzyContains(key, q)) return 35;
  return 0;
}

export function search(index: SearchIndex, query: string, limit = 30): Product[] {
  const q = normalize(query);
  if (!q) return [];
  const ws = words(query);
  const scored: { p: Product; s: number }[] = [];
  for (const e of index.entries) {
    let best = 0;
    for (const { k, w } of e.keys) {
      const s = scoreKey(k, q);
      if (s) best = Math.max(best, s + w);
    }
    // multi-word queries in any order ("תפוזים מיץ")
    if (!best && ws.length > 1) {
      const all = ws.every((wd) => e.keys.some(({ k }) => k.includes(wd) || (wd.length >= 3 && fuzzyContains(k, wd))));
      if (all) best = 30;
    }
    if (best) scored.push({ p: e.p, s: best });
  }
  scored.sort((a, b) => b.s - a.s || a.p.name.length - b.p.name.length);
  return scored.slice(0, limit).map((x) => x.p);
}
