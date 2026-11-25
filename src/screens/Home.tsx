import { useMemo, useState } from 'react';
import { useApp } from '../state';
import { go } from '../lib/router';
import { search } from '../lib/search';
import { resolveFor } from '../lib/content';
import { Barcode, Chevron, Close, Question, Search } from '../components/Icons';
import { BlessingDot } from '../components/ui';
import type { Product } from '../lib/types';

export function dayIndex(now = new Date(), n: number) {
  const start = Date.UTC(2024, 0, 1);
  const days = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - start) / 86400000);
  return ((days % n) + n) % n;
}

export function ProductRow({ p, onPick }: { p: Product; onPick?: (p: Product) => void }) {
  const { content, nusach } = useApp();
  const r = resolveFor(p, nusach ?? 'sefaradi');
  return (
    <button className="list-item" onClick={() => (onPick ? onPick(p) : go(`product/${p.id}`))}>
      <BlessingDot k={r.first} />
      <span className="grow">
        {p.name}
        <span className="sub">
          {content.blessings.first[r.first].name}
          {p.brand ? ` · ${p.brand}` : ''}
          {p.doubt ? ' · ספק' : ''}
        </span>
      </span>
      <Chevron className="chev" size={20} />
    </button>
  );
}

export function SearchBox({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <label className="search">
      <Search size={22} style={{ color: 'var(--ink-3)' }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="חפשו מוצר או מאכל"
        enterKeyHint="search"
        autoFocus={autoFocus}
        aria-label="חיפוש מוצר"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="ניקוי">
          <Close size={20} style={{ color: 'var(--ink-3)' }} />
        </button>
      )}
    </label>
  );
}

export function Home() {
  const { content, index, recents } = useApp();
  const [q, setQ] = useState('');
  const results = useMemo(() => search(index, q), [index, q]);
  const rule = content.rules[dayIndex(new Date(), content.rules.length)];
  const mine = recents.map((id) => content.products.find((p) => p.id === id)).filter(Boolean) as Product[];

  return (
    <>
      <h1 className="h-display fade-up">מה מברכים?</h1>
      <div className="search-row fade-up d1">
        <SearchBox value={q} onChange={setQ} />
        <button className="scan-btn" onClick={() => go('scan')} aria-label="סריקת ברקוד">
          <Barcode size={28} />
        </button>
      </div>

      {q.trim() ? (
        <div className="card fade-up" style={{ marginTop: 16 }}>
          {results.length ? (
            <ul className="list">
              {results.map((p) => (
                <li key={p.id}>
                  <ProductRow p={p} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="center" style={{ padding: '12px 0' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>לא מצאנו "{q}"</div>
              <p className="muted">ננסה לגלות יחד בכמה שאלות פשוטות.</p>
              <button className="btn" onClick={() => go('wizard')}>
                <Question /> לא מצאתי – עזרו לי
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button className="card tap accent fade-up d2" style={{ marginTop: 18 }} onClick={() => go(`rule/${rule.id}`)}>
            <div className="card-kicker">כלל של היום</div>
            <div className="card-title">{rule.title}</div>
            <div className="muted">{rule.short}</div>
          </button>

          <div className="card fade-up d3">
            <div className="card-title">המוצרים שלי</div>
            {mine.length ? (
              <ul className="list">
                {mine.map((p) => (
                  <li key={p.id}>
                    <ProductRow p={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small" style={{ margin: 0 }}>
                כאן יופיעו 8 המוצרים האחרונים שבדקתם.
              </p>
            )}
          </div>

          <button className="card tap fade-up d4" onClick={() => go('wizard')} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="bdot lg" style={{ background: 'var(--gold)' }}>
              <Question size={28} />
            </span>
            <span style={{ flex: 1 }}>
              <span className="card-title" style={{ display: 'block' }}>
                לא מוצאים מוצר?
              </span>
              <span className="muted small">כמה שאלות קצרות ונגיע לברכה הנכונה</span>
            </span>
            <Chevron className="chev" />
          </button>
        </>
      )}
    </>
  );
}
