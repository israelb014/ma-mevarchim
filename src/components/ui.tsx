import type { ReactNode } from 'react';
import { BLESSING_ICONS, Back, Book, Candles, Dots, Home } from './Icons';
import { back, go } from '../lib/router';
import { useApp } from '../state';
import type { FirstKey } from '../lib/types';

export function Ring({
  value,
  max,
  size = 64,
  stroke = 7,
  color = 'var(--olive)',
  track = '#ece4d2',
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = max ? Math.min(1, value / max) : 0;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg) scaleY(-1)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
        />
      </svg>
      {children && <div className="ring-label">{children}</div>}
    </div>
  );
}

export function BlessingDot({ k, size = 'md' }: { k: FirstKey; size?: 'md' | 'lg' | 'xl' }) {
  const { content } = useApp();
  const b = content.blessings.first[k];
  const Icon = BLESSING_ICONS[b.icon];
  const px = size === 'xl' ? 46 : size === 'lg' ? 30 : 20;
  return (
    <span className={`bdot ${size === 'md' ? '' : size}`} style={{ background: b.color }} aria-hidden="true">
      <Icon size={px} />
    </span>
  );
}

export function TopBar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="topbar">
      <button className="icon-btn" onClick={onBack ?? (() => back())} aria-label="חזרה">
        <Back />
      </button>
      {title ? <div style={{ fontWeight: 800 }}>{title}</div> : <span />}
      {right ?? <span style={{ width: 44 }} />}
    </div>
  );
}

const TABS = [
  { id: 'home', label: 'בית', Icon: Home, match: ['home', 'product', 'scan', 'wizard', 'search'] },
  { id: 'learn', label: 'למידה', Icon: Book, match: ['learn', 'rule', 'quiz', 'kids'] },
  { id: 'shabbat', label: 'שבת וחג', Icon: Candles, match: ['shabbat'] },
  { id: 'more', label: 'עוד', Icon: Dots, match: ['more', 'extra', 'sources', 'about', 'nusach'] },
];

export function BottomNav({ route }: { route: string }) {
  return (
    <nav className="nav" aria-label="ניווט ראשי">
      {TABS.map(({ id, label, Icon, match }) => {
        const on = match.includes(route);
        return (
          <button key={id} className={on ? 'on' : ''} onClick={() => go(id)} aria-current={on ? 'page' : undefined}>
            <Icon size={26} stroke={on ? 2.3 : 1.9} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
