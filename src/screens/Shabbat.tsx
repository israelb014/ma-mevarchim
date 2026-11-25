import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../state';
import { go } from '../lib/router';
import { suggestedEvent } from '../lib/shabbat';
import { isAndroid, isNative, openExternal, SITE_URL } from '../lib/platform';
import { EVENT_ICONS, Printer } from '../components/Icons';
import { Sheet } from '../components/Sheet';

export function Shabbat({ event }: { event?: string | null }) {
  const { content, nusach: n } = useApp();
  const nusach = n ?? 'sefaradi';
  const [sel, setSel] = useState(event && content.events.some((e) => e.id === event) ? event : suggestedEvent(new Date()));
  const ev = content.events.find((e) => e.id === sel) ?? content.events[0];

  const print = () => {
    if (isNative() && isAndroid()) {
      openExternal(`${SITE_URL}print.html?event=${encodeURIComponent(ev.id)}&nusach=${nusach}`);
    } else window.print();
  };

  return (
    <>
      <h1 className="h-title fade-up" style={{ marginTop: 18 }}>
        דף ברכות להדפסה
      </h1>
      <div className="pills fade-up d1" role="tablist">
        {content.events.map((e) => {
          const I = EVENT_ICONS[e.icon];
          return (
            <button
              key={e.id}
              role="tab"
              aria-selected={e.id === sel}
              className={`pill ${e.id === sel ? 'on' : ''}`}
              onClick={() => {
                setSel(e.id);
                go(`shabbat?event=${e.id}`, true);
              }}
            >
              {I && <I size={18} />}
              {e.title}
            </button>
          );
        })}
      </div>
      <div className="sheet-preview fade-up d2" key={sel}>
        <Sheet content={content} eventId={ev.id} nusach={nusach} />
      </div>
      <button className="btn fade-up d3" onClick={print}>
        <Printer /> הדפסה
      </button>
      <p className="center muted small">הדפיסו לפני {ev.id === 'tu-bishvat' ? 'החג' : 'שבת או החג'} · נוסח {nusach === 'ashkenaz' ? 'אשכנז' : 'עדות המזרח'}</p>
      {createPortal(<Sheet content={content} eventId={ev.id} nusach={nusach} />, document.getElementById('print-root')!)}
    </>
  );
}
