import { useEffect, useState, type ReactNode } from 'react';
import { useApp } from '../state';
import { go } from '../lib/router';
import { blessingText, isDrink, resolveFor, shiurFor } from '../lib/content';
import { hebrewVoiceAvailable, speak } from '../lib/tts';
import { APP_VERSION, openExternal, whatsappUrl } from '../lib/platform';
import { Alert, BLESSING_ICONS, Flag, Info, Scroll, Speaker } from '../components/Icons';
import { TopBar } from '../components/ui';
import type { FirstKey, LastKey } from '../lib/types';

export interface ResultData {
  name: string;
  brand?: string;
  first: FirstKey;
  last: LastKey;
  why: string;
  rule_id: string;
  source?: string;
  diffText?: string;
  doubt?: boolean;
  note?: string;
  drink?: boolean;
  extra?: ReactNode;
}

export function ResultView({ d }: { d: ResultData }) {
  const { content, nusach: n } = useApp();
  const nusach = n ?? 'sefaradi';
  const b = content.blessings.first[d.first];
  const last = content.blessings.last[d.last];
  const rule = content.rules.find((r) => r.id === d.rule_id);
  const Icon = BLESSING_ICONS[b.icon];
  const shiur = shiurFor(content, d.last, nusach, !!d.drink);
  const [canSpeak, setCanSpeak] = useState(false);
  const shRule = content.rules.find((r) => r.id === 'shehakol-bedieved');

  useEffect(() => {
    hebrewVoiceAvailable().then(setCanSpeak);
  }, []);

  return (
    <>
      <h1 className="h-title fade-up" style={{ textAlign: 'center' }}>
        {d.name}
        {d.brand && <div className="muted small" style={{ fontWeight: 600 }}>{d.brand}</div>}
      </h1>

      {d.doubt && (
        <div className="card fade-up" style={{ background: '#fdf0e8' }}>
          <div className="chips" style={{ marginBottom: 8 }}>
            <span className="chip warn">
              <Alert size={16} /> ספק – כדאי לשאול רב
            </span>
          </div>
          <div className="small">
            <b>{shRule?.title}:</b> {shRule?.short}
          </div>
        </div>
      )}

      <section className="hero" style={{ background: `linear-gradient(160deg, ${b.color}, ${shade(b.color)})` }}>
        <div className="kicker">
          <Icon size={22} /> ברכה ראשונה
        </div>
        <div className="bname">{b.name}</div>
        <div className="btext">{blessingText(content, d.first, nusach)}</div>
      </section>

      <div className="card fade-up d1">
        <div className="card-kicker">ברכה אחרונה</div>
        <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.15 }}>{last.name}</div>
        {shiur && <div className="muted" style={{ marginTop: 6 }}>{shiur}</div>}
        {d.note && <div className="small" style={{ marginTop: 8, color: 'var(--ink-2)' }}>{d.note}</div>}
      </div>

      <div className="card fade-up d2">
        <div className="card-kicker">למה?</div>
        <div style={{ fontSize: 18, fontWeight: 500 }}>{d.why}</div>
        {rule && (
          <div className="chips" style={{ marginTop: 12 }}>
            <button className="chip" onClick={() => go(`rule/${rule.id}`)}>
              הכלל: {rule.title}
            </button>
          </div>
        )}
      </div>

      {d.extra}

      {canSpeak && (
        <button className="btn secondary fade-up d3" style={{ marginBottom: 14 }} onClick={() => speak(blessingText(content, d.first, nusach, true))}>
          <Speaker /> השמעת הברכה
        </button>
      )}

      {d.diffText && (
        <div className="card tight fade-up d3" style={{ display: 'flex', gap: 10 }}>
          <Info size={22} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <b>הבדלי עדות: </b>
            {d.diffText}
          </div>
        </div>
      )}

      {d.source && (
        <div className="card tight fade-up d4 small muted" style={{ display: 'flex', gap: 10 }}>
          <Scroll size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>מקור: {d.source}</div>
        </div>
      )}

      <button
        className="btn ghost"
        onClick={() => openExternal(whatsappUrl(`דיווח על טעות באפליקציית "מה מברכים"\nמוצר: ${d.name}\nגרסה: ${APP_VERSION}\n\nמה לא נכון:`))}
      >
        <Flag size={18} /> דיווח על טעות
      </button>
    </>
  );
}

function shade(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * 0.78));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

export function ProductScreen({ id }: { id?: string }) {
  const { content, nusach, addRecent } = useApp();
  const p = content.products.find((x) => x.id === id);
  useEffect(() => {
    if (p) addRecent(p.id);
  }, [p?.id]);
  if (!p) {
    return (
      <>
        <TopBar />
        <h1 className="h-title">המוצר לא נמצא</h1>
        <button className="btn" onClick={() => go('home')}>לחיפוש</button>
      </>
    );
  }
  const r = resolveFor(p, nusach ?? 'sefaradi');
  const diffText = p.nusach_diff?.text ?? (r.first === 'hagafen' ? `ספרדים אומרים "הַגֶּפֶן" ואשכנזים "הַגָּפֶן".` : undefined);
  return (
    <>
      <TopBar />
      <ResultView
        d={{
          name: p.name,
          brand: p.brand,
          first: r.first,
          last: r.last,
          why: p.why,
          rule_id: p.rule_id,
          source: p.source,
          diffText,
          doubt: p.doubt,
          note: p.note,
          drink: isDrink(p),
        }}
      />
    </>
  );
}
