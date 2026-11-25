import type { Content, Nusach } from '../lib/types';
import { blessingText } from '../lib/content';

export function Sheet({ content, eventId, nusach }: { content: Content; eventId: string; nusach: Nusach }) {
  const ev = content.events.find((e) => e.id === eventId) ?? content.events[0];
  const steps = ev.steps[nusach];
  return (
    <div className="sheet">
      <h1>{ev.title}</h1>
      <div className="sub">
        {ev.subtitle} · נוסח {nusach === 'ashkenaz' ? 'אשכנז' : 'עדות המזרח'}
      </div>
      <ol>
        {steps.map((s, i) => (
          <li key={i}>
            <div>
              <div className="st">{s.title}</div>
              {s.blessing && <div className="sx">{blessingText(content, s.blessing, nusach)}</div>}
              {s.text && <div className="sx">{s.text}</div>}
              {s.note && <div className="sn">{s.note}</div>}
            </div>
          </li>
        ))}
      </ol>
      <div className="foot">מה מברכים · הדף מכיל דברי קדושה – נא לא לזרוק לפח</div>
    </div>
  );
}
