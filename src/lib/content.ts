import rulesJson from '../../public/data/rules.json';
import productsJson from '../../public/data/products.json';
import eventsJson from '../../public/data/events.json';
import extraJson from '../../public/data/extra-blessings.json';
import versionJson from '../../public/data/data-version.json';
import * as db from './db';
import { remoteBase } from './platform';
import type { Content, FirstKey, LastKey, Nusach, Product } from './types';

export function bundledContent(): Content {
  return {
    version: versionJson.version,
    updated: versionJson.updated,
    blessings: rulesJson.blessings as Content['blessings'],
    rules: rulesJson.rules as Content['rules'],
    products: productsJson.products as Product[],
    categories: productsJson.categories,
    events: eventsJson.events as Content['events'],
    extra: extraJson.blessings,
  };
}

/** Bundled copy, or a newer copy previously downloaded and stored in IndexedDB. */
export async function loadContent(): Promise<Content> {
  const base = bundledContent();
  const cached = await db.get<Content>('content');
  return cached && cached.version > base.version ? cached : base;
}

/** If online, checks data-version.json and downloads newer content. Returns it, or null. */
export async function refreshContent(current: Content): Promise<Content | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
  try {
    const base = remoteBase() + 'data/';
    const bust = `?t=${Date.now()}`;
    const v = await (await fetch(base + 'data-version.json' + bust, { cache: 'no-store' })).json();
    if (!(v.version > current.version)) return null;
    const [r, p, e, x] = await Promise.all(
      ['rules', 'products', 'events', 'extra-blessings'].map((n) =>
        fetch(base + n + '.json' + bust, { cache: 'no-store' }).then((res) => {
          if (!res.ok) throw new Error(n);
          return res.json();
        })
      )
    );
    const next: Content = {
      version: v.version,
      updated: v.updated,
      blessings: r.blessings,
      rules: r.rules,
      products: p.products,
      categories: p.categories,
      events: e.events,
      extra: x.blessings,
    };
    if (!next.products?.length || !next.rules?.length) return null;
    await db.set('content', next);
    return next;
  } catch {
    return null;
  }
}

export interface Resolved {
  first: FirstKey;
  last: LastKey;
}
export function resolveFor(p: Product, nusach: Nusach): Resolved {
  const o = nusach === 'ashkenaz' ? p.nusach_diff?.ashkenaz : undefined;
  return { first: o?.first ?? p.first, last: o?.last ?? p.last };
}

export function blessingText(c: Content, key: FirstKey, nusach: Nusach, spoken = false): string {
  const b = c.blessings.first[key];
  const ending = nusach === 'ashkenaz' && b.ending_ashkenaz ? b.ending_ashkenaz : b.ending;
  return `${spoken ? c.blessings.prefix_spoken : c.blessings.prefix} ${ending}`;
}

export function shiurFor(c: Content, last: LastKey, nusach: Nusach, isDrink: boolean): string | null {
  if (last === 'none') return null;
  if (last === 'bh') return c.blessings.shiur.bread[nusach];
  if (last === 'gefen' || isDrink) return c.blessings.shiur.drink[nusach];
  return c.blessings.shiur.food[nusach];
}

export const isDrink = (p: Product) => p.category === 'drinks';
