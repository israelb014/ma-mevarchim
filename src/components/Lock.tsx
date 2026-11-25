import { useEffect, useState } from 'react';
import { lockState, type LockState } from '../lib/shabbat';
import { Candles } from './Icons';

export function useLock(): LockState {
  const [s, setS] = useState<LockState>(() => lockState(new Date()));
  useEffect(() => {
    const t = setInterval(() => setS(lockState(new Date())), 30_000);
    const vis = () => setS(lockState(new Date()));
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);
  return s;
}

export function LockScreen({ s }: { s: LockState }) {
  const title = s.kind === 'chag' ? 'חג שמח' : s.kind === 'both' ? 'שבת שלום וחג שמח' : 'שבת שלום';
  return (
    <div className="lock" role="alert">
      <div className="fade-up">
        <Candles size={84} stroke={1.5} style={{ color: '#E8C860' }} />
        <h1>{title}</h1>
        <p style={{ fontSize: 19, opacity: 0.85, margin: 0 }}>האפליקציה נחה עד צאת {s.kind === 'shabbat' ? 'השבת' : 'החג'}.</p>
      </div>
    </div>
  );
}
