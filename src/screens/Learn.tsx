import { useMemo, useState } from 'react';
import { useApp } from '../state';
import { go } from '../lib/router';
import { buildQuiz, isLearned, LEARNED_AT, type Question } from '../lib/quiz';
import { resolveFor } from '../lib/content';
import { BLESSING_ICONS, Bolt, Check, Child, Star } from '../components/Icons';
import { BlessingDot, Ring, TopBar } from '../components/ui';
import { ProductRow } from './Home';
import type { FirstKey } from '../lib/types';

export function Learn() {
  const { content, progress } = useApp();
  const learned = content.rules.filter((r) => isLearned(progress, r.id)).length;
  return (
    <>
      <h1 className="h-display fade-up" style={{ textAlign: 'center' }}>
        הכללים שלי
      </h1>
      <div className="fade-up d1" style={{ display: 'grid', placeItems: 'center', marginBottom: 20 }}>
        <Ring value={learned} max={content.rules.length} size={170} stroke={16} color="var(--olive)" track="#f0e3b6">
          <div>
            <div style={{ fontSize: 48, fontWeight: 900 }}>{learned}</div>
            <div className="muted" style={{ fontWeight: 700 }}>מתוך {content.rules.length} כללים</div>
          </div>
        </Ring>
      </div>
      <div className="btn-row fade-up d2" style={{ marginBottom: 20 }}>
        <button className="btn" onClick={() => go('quiz')}>
          <Bolt /> חידון מהיר
        </button>
        <button className="btn secondary" onClick={() => go('kids')}>
          <Child /> מצב ילדים
        </button>
      </div>
      <div className="grid2">
        {content.rules.map((r, i) => {
          const b = content.blessings.first[r.blessing];
          const v = Math.min(progress[r.id] ?? 0, LEARNED_AT);
          return (
            <button key={r.id} className="tile" style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }} onClick={() => go(`rule/${r.id}`)}>
              <Ring value={v} max={LEARNED_AT} size={46} stroke={5} color={b.color}>
                {v >= LEARNED_AT ? <Check size={20} style={{ color: b.color }} /> : null}
              </Ring>
              {r.title}
            </button>
          );
        })}
      </div>
    </>
  );
}

export function RuleScreen({ id }: { id?: string }) {
  const { content, progress } = useApp();
  const r = content.rules.find((x) => x.id === id);
  if (!r) return <TopBar />;
  const items = content.products.filter((p) => p.rule_id === r.id);
  const b = content.blessings.first[r.blessing];
  const v = Math.min(progress[r.id] ?? 0, LEARNED_AT);
  return (
    <>
      <TopBar />
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0' }}>
        <Ring value={v} max={LEARNED_AT} size={58} stroke={6} color={b.color}>
          <span style={{ fontWeight: 900, fontSize: 14 }}>
            {v}/{LEARNED_AT}
          </span>
        </Ring>
        <h1 className="h-title" style={{ margin: 0 }}>
          {r.title}
        </h1>
      </div>
      <div className="card accent fade-up d1">
        <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>{r.short}</div>
        <div className="muted">{r.explanation}</div>
      </div>
      <div className="card fade-up d2">
        <div className="card-title">דוגמאות</div>
        <div className="chips">
          {r.examples.map((e) => (
            <span key={e} className="chip">
              {e}
            </span>
          ))}
        </div>
      </div>
      {items.length > 0 && (
        <div className="card fade-up d3">
          <div className="card-title">מוצרים שהכלל חל עליהם</div>
          <ul className="list">
            {items.slice(0, 40).map((p) => (
              <li key={p.id}>
                <ProductRow p={p} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="card tight small muted">מקור: {r.source}</div>
    </>
  );
}

export function Quiz() {
  const { content, nusach, recents, progress, recordAnswer } = useApp();
  const [seed, setSeed] = useState(0);
  const qs = useMemo(() => buildQuiz(content, nusach ?? 'sefaradi', recents, progress, 5), [seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  if (i >= qs.length) {
    return (
      <>
        <TopBar onBack={() => go('learn', true)} />
        <div className="center celebrate" style={{ marginTop: 30 }}>
          <Ring value={score} max={qs.length} size={170} stroke={16} color="var(--gold)">
            <div>
              <div style={{ fontSize: 48, fontWeight: 900 }}>{score}</div>
              <div className="muted" style={{ fontWeight: 700 }}>מתוך {qs.length}</div>
            </div>
          </Ring>
          <h1 className="h-title" style={{ marginTop: 20 }}>
            {score === qs.length ? 'מושלם!' : score >= 3 ? 'כל הכבוד!' : 'ממשיכים ללמוד'}
          </h1>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={() => { setSeed(seed + 1); setI(0); setScore(0); setPicked(null); }}>
            חידון נוסף
          </button>
          <button className="btn secondary" onClick={() => go('learn', true)}>
            לכללים
          </button>
        </div>
      </>
    );
  }

  const q: Question = qs[i];
  const answer = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    const ok = k === q.answer;
    if (ok) setScore((s) => s + 1);
    recordAnswer(q.rule_id, ok);
  };
  const rule = content.rules.find((r) => r.id === q.rule_id);
  return (
    <>
      <TopBar onBack={() => go('learn', true)} />
      <div className="center">
        <div className="muted small" style={{ fontWeight: 700 }}>
          שאלה {i + 1} מתוך {qs.length}
        </div>
        <div style={{ display: 'grid', placeItems: 'center', margin: '10px 0' }}>
          <Ring value={i + 1} max={qs.length} size={64} stroke={7} color="var(--gold)" />
        </div>
        <h1 className="h-title" key={i}>
          {q.text}
        </h1>
      </div>
      <div key={'o' + i}>
        {q.options.map((o, k) => {
          const cls = picked === null ? '' : k === q.answer ? 'correct' : k === picked ? 'wrong' : '';
          const bk = q.blessingKeys?.[k];
          return (
            <button key={k} className={`option ${cls}`} style={{ animationDelay: `${k * 0.05}s` }} onClick={() => answer(k)}>
              {bk && <BlessingDot k={bk} />}
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="fade-up">
          {rule && (
            <div className="card tight small">
              <b>{rule.title}: </b>
              {rule.short}
            </div>
          )}
          <button className="btn" onClick={() => { setI(i + 1); setPicked(null); }}>
            {i + 1 < qs.length ? 'הבא' : 'סיום'}
          </button>
        </div>
      )}
    </>
  );
}

const KIDS_ORDER: FirstKey[] = ['hamotzi', 'mezonot', 'hagafen', 'haetz', 'haadama', 'shehakol'];
const PRAISE = ['כל הכבוד!', 'מעולה!', 'אלוף!', 'יפה מאוד!', 'נכון!'];

export function Kids() {
  const { content, nusach } = useApp();
  const pool = useMemo(
    () => content.products.filter((p) => !p.doubt && !p.nusach_diff && p.name.length <= 14 && ['fruits', 'vegetables', 'bread', 'pastries', 'drinks', 'dairy', 'sweets', 'snacks', 'grains'].includes(p.category)),
    [content]
  );
  const pick = () => pool[Math.floor(Math.random() * pool.length)];
  const [p, setP] = useState(pick);
  const [state, setState] = useState<'ask' | 'yes' | 'try'>('ask');
  const [stars, setStars] = useState(0);
  const correct = resolveFor(p, nusach ?? 'sefaradi').first;

  const choose = (k: FirstKey) => {
    if (state === 'yes') return;
    if (k === correct) {
      setState('yes');
      setStars((s) => s + 1);
      setTimeout(() => {
        setP(pick());
        setState('ask');
      }, 1400);
    } else setState('try');
  };
  return (
    <>
      <TopBar onBack={() => go('learn', true)} right={<span className="chip gold"><Star size={16} /> {stars}</span>} />
      <div className="kid-name" key={p.id}>
        {state === 'yes' ? <span className="celebrate" style={{ color: '#3F7D3A' }}>{PRAISE[stars % PRAISE.length]}</span> : p.name}
      </div>
      <p className="center muted" style={{ fontSize: 20, fontWeight: 700, marginTop: -8 }}>
        {state === 'try' ? 'כמעט! נסו שוב' : 'מה מברכים?'}
      </p>
      <div className="kids-grid">
        {KIDS_ORDER.map((k) => {
          const b = content.blessings.first[k];
          const I = BLESSING_ICONS[b.icon];
          return (
            <button key={k} className="kid-btn" style={{ background: b.color, opacity: state === 'yes' && k !== correct ? 0.35 : 1 }} onClick={() => choose(k)}>
              <I size={46} />
              {b.name}
            </button>
          );
        })}
      </div>
    </>
  );
}
