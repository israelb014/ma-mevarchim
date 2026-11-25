import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../state';
import { go } from '../lib/router';
import { search } from '../lib/search';
import { Barcode, Close, Keyboard } from '../components/Icons';
import { TopBar } from '../components/ui';
import { ProductRow, SearchBox } from './Home';

type Phase = { k: 'scan' } | { k: 'manual' } | { k: 'unknown'; code: string } | { k: 'error'; msg: string };

interface Detector {
  detect(src: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}

export function Scan() {
  const { barcodes, index, linkBarcode } = useApp();
  const [phase, setPhase] = useState<Phase>({ k: 'scan' });
  const [q, setQ] = useState('');
  const [manual, setManual] = useState('');
  const results = useMemo(() => search(index, q), [index, q]);

  const found = (code: string) => {
    const clean = code.replace(/\D/g, '') || code;
    if (barcodes[clean]) go(`product/${barcodes[clean]}`, true);
    else setPhase({ k: 'unknown', code: clean });
  };

  if (phase.k === 'scan') return <Camera onCode={found} onManual={() => setPhase({ k: 'manual' })} onError={(msg) => setPhase({ k: 'error', msg })} />;

  if (phase.k === 'manual' || phase.k === 'error') {
    return (
      <>
        <TopBar onBack={() => go('home', true)} />
        <h1 className="h-title">הקלדת ברקוד</h1>
        {phase.k === 'error' && <div className="card tight muted">{phase.msg}</div>}
        <div className="search" style={{ marginBottom: 16 }}>
          <Barcode size={22} style={{ color: 'var(--ink-3)' }} />
          <input inputMode="numeric" value={manual} onChange={(e) => setManual(e.target.value.replace(/\D/g, ''))} placeholder="המספר שמתחת לברקוד" aria-label="מספר ברקוד" />
        </div>
        <button className="btn" disabled={manual.length < 6} onClick={() => found(manual)}>
          המשך
        </button>
        <button className="btn ghost" onClick={() => setPhase({ k: 'scan' })}>
          חזרה למצלמה
        </button>
      </>
    );
  }

  return (
    <>
      <TopBar onBack={() => go('home', true)} />
      <h1 className="h-title fade-up">לא מצאנו את המוצר</h1>
      <p className="muted fade-up d1" style={{ fontSize: 18 }}>
        חפשו אותו בשם פעם אחת ונזכור אותו. בפעם הבאה הסריקה תביא אתכם ישר לברכה.
      </p>
      <div className="chip gold fade-up d1" style={{ marginBottom: 14 }}>
        ברקוד {phase.code}
      </div>
      <SearchBox value={q} onChange={setQ} autoFocus />
      {q && (
        <div className="card" style={{ marginTop: 14 }}>
          <ul className="list">
            {results.map((p) => (
              <li key={p.id}>
                <ProductRow
                  p={p}
                  onPick={(pp) => {
                    linkBarcode(phase.code, pp.id);
                    go(`product/${pp.id}`, true);
                  }}
                />
              </li>
            ))}
          </ul>
          {!results.length && (
            <button className="btn" onClick={() => go('wizard')}>
              לא מצאתי – בורר שאלות
            </button>
          )}
        </div>
      )}
    </>
  );
}

function Camera({ onCode, onManual, onError }: { onCode: (c: string) => void; onManual: () => void; onError: (m: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const done = useRef(false);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let stopZxing: (() => void) | undefined;
    let timer: number | undefined;
    const hit = (code: string) => {
      if (done.current) return;
      done.current = true;
      navigator.vibrate?.(60);
      onCode(code);
    };
    (async () => {
      try {
        const BD = (window as unknown as { BarcodeDetector?: new (o: unknown) => Detector }).BarcodeDetector;
        if (BD) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
          const v = video.current!;
          v.srcObject = stream;
          await v.play();
          const det = new BD({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'] });
          const tick = async () => {
            if (done.current) return;
            try {
              const r = await det.detect(v);
              if (r[0]?.rawValue) return hit(r[0].rawValue);
            } catch {
              /* frame not ready */
            }
            timer = window.setTimeout(tick, 180);
          };
          tick();
        } else {
          const { BrowserMultiFormatReader } = await import('@zxing/browser');
          const reader = new BrowserMultiFormatReader();
          const controls = await reader.decodeFromConstraints({ video: { facingMode: 'environment' } }, video.current!, (res) => {
            if (res) hit(res.getText());
          });
          stopZxing = () => controls.stop();
        }
      } catch {
        onError('לא הצלחנו לפתוח את המצלמה. אפשר להקליד את מספר הברקוד או לחפש בשם.');
      }
    })();
    return () => {
      done.current = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      stopZxing?.();
    };
  }, []);

  return (
    <div className="scanner">
      <video ref={video} playsInline muted />
      <button className="close" onClick={() => go('home', true)} aria-label="סגירה">
        <Close />
      </button>
      <div className="frame">
        <i />
        <i />
        <i />
        <i />
        <div className="laser" />
      </div>
      <div className="bottom">
        <h2>כוונו את הברקוד למסגרת</h2>
        <button className="btn light" onClick={onManual}>
          <Keyboard /> הקלדה ידנית
        </button>
      </div>
    </div>
  );
}
