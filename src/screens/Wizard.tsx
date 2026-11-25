import { useState } from 'react';
import { useApp } from '../state';
import { ICONS } from '../components/Icons';
import { Ring, TopBar } from '../components/ui';
import { UNKNOWN_RESULT, walk, type WizardResult } from '../lib/wizard';
import { ResultView } from './Result';

export function Wizard() {
  const { content } = useApp();
  const [answers, setAnswers] = useState<number[]>([]);
  const [unknown, setUnknown] = useState(false);
  const state = walk(answers);

  if (unknown || state.done) {
    const result: WizardResult = unknown ? UNKNOWN_RESULT : (state as { result: WizardResult }).result;
    const rule = content.rules.find((r) => r.id === result.rule_id);
    return (
      <>
        <TopBar onBack={() => (unknown ? setUnknown(false) : setAnswers(answers.slice(0, -1)))} />
        <ResultView
          d={{
            name: 'התוצאה שלנו',
            first: result.first,
            last: result.last,
            why: result.note ?? rule?.short ?? '',
            rule_id: result.rule_id,
            source: rule?.source,
            doubt: result.doubt,
            drink: result.last === 'gefen' || state.path.some((p) => p.answer.includes('משקה')),
            extra: (
              <div className="card fade-up d2">
                <div className="card-kicker">איך הגענו לזה</div>
                <ol style={{ margin: 0, paddingInlineStart: 20 }}>
                  {state.path.map((s, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {s.question} <b>{s.answer}</b>
                    </li>
                  ))}
                  {unknown && <li>לא ידוע ממה המוצר עשוי</li>}
                </ol>
              </div>
            ),
          }}
        />
        <button className="btn secondary" onClick={() => { setAnswers([]); setUnknown(false); }}>
          מוצר אחר
        </button>
      </>
    );
  }

  const { node, step } = state;
  return (
    <>
      <TopBar onBack={answers.length ? () => setAnswers(answers.slice(0, -1)) : undefined} />
      <div className="center fade-up" key={node.id + 'h'}>
        <div className="muted small" style={{ fontWeight: 700 }}>שאלה {step + 1}</div>
        <div style={{ display: 'grid', placeItems: 'center', margin: '10px 0' }}>
          <Ring value={step + 1} max={4} size={70} stroke={8} color="var(--gold)">
            <span style={{ fontWeight: 900 }}>{step + 1}</span>
          </Ring>
        </div>
        <h1 className="h-title">{node.question}</h1>
        {node.help && <p className="muted" style={{ marginTop: -6 }}>{node.help}</p>}
      </div>
      <div key={node.id} style={{ marginTop: 18 }}>
        {node.options.map((o, i) => {
          const I = o.icon ? ICONS[o.icon] : undefined;
          return (
            <button key={i} className="option" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setAnswers([...answers, i])}>
              {I && (
                <span className="opt-ico">
                  <I size={24} />
                </span>
              )}
              <span>
                {o.label}
                {o.hint && <span className="hint">{o.hint}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <button className="btn ghost" onClick={() => setUnknown(true)}>
        לא יודע
      </button>
    </>
  );
}
