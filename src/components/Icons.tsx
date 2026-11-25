import type { CSSProperties, ReactNode } from 'react';

interface P {
  size?: number;
  className?: string;
  style?: CSSProperties;
  stroke?: number;
}

const S = ({ size = 24, className, style, stroke = 2, children, fill = 'none' }: P & { children: ReactNode; fill?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {children}
  </svg>
);

// ---- Blessing symbols ----
export const Bread = (p: P) => (
  <S {...p}>
    <path d="M4 11.5C4 7.9 7.6 5.5 12 5.5s8 2.4 8 6c0 1.2-.8 1.8-1.6 2V18a1.5 1.5 0 0 1-1.5 1.5H7.1A1.5 1.5 0 0 1 5.6 18v-4.5C4.8 13.3 4 12.7 4 11.5Z" />
    <path d="M9 9.5l1 1.5M12.5 8.8l1 1.6M15.5 9.5l.8 1.3" />
  </S>
);
export const Wheat = (p: P) => (
  <S {...p}>
    <path d="M12 21V8" />
    <path d="M12 8c-2.2-.4-3-2.4-3-4.5 2.2.3 3 2.3 3 4.5Zm0 0c2.2-.4 3-2.4 3-4.5-2.2.3-3 2.3-3 4.5Z" />
    <path d="M12 12.5c-2.4-.2-3.6-2-3.8-4 2.4.2 3.6 2 3.8 4Zm0 0c2.4-.2 3.6-2 3.8-4-2.4.2-3.6 2-3.8 4Z" />
    <path d="M12 17c-2.4-.2-3.6-2-3.8-4 2.4.2 3.6 2 3.8 4Zm0 0c2.4-.2 3.6-2 3.8-4-2.4.2-3.6 2-3.8 4Z" />
  </S>
);
export const Grapes = (p: P) => (
  <S {...p}>
    <path d="M12 6V3.5M12 5c1.2-1.6 3-2 4.5-1.6" />
    <circle cx="9.5" cy="9" r="2.2" />
    <circle cx="14.5" cy="9" r="2.2" />
    <circle cx="12" cy="13" r="2.2" />
    <circle cx="7.5" cy="13" r="2.2" />
    <circle cx="16.5" cy="13" r="2.2" />
    <circle cx="9.8" cy="17" r="2.2" />
    <circle cx="14.2" cy="17" r="2.2" />
  </S>
);
export const Leaf = (p: P) => (
  <S {...p}>
    <path d="M5 19c0-8 5-14 15-14 0 10-6 15-13 15" />
    <path d="M5 19c3-4 6-7 10-9.5" />
  </S>
);
export const Sprout = (p: P) => (
  <S {...p}>
    <path d="M12 20v-8" />
    <path d="M12 12c0-3.5-2.5-6-7-6 0 3.8 2.6 6 7 6Z" />
    <path d="M12 10c0-3.2 2.4-5.5 7-5.5 0 3.6-2.6 5.5-7 5.5Z" />
    <path d="M7 20h10" />
  </S>
);
export const Drop = (p: P) => (
  <S {...p}>
    <path d="M12 3.5c3.5 4.4 6 7.7 6 10.7a6 6 0 0 1-12 0c0-3 2.5-6.3 6-10.7Z" />
    <path d="M9.2 14.5a2.8 2.8 0 0 0 2.6 2.7" />
  </S>
);

export const BLESSING_ICONS: Record<string, (p: P) => ReactNode> = {
  bread: Bread,
  wheat: Wheat,
  grapes: Grapes,
  leaf: Leaf,
  sprout: Sprout,
  drop: Drop,
};

// ---- UI icons ----
export const Home = (p: P) => (
  <S {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1Z" />
  </S>
);
export const Book = (p: P) => (
  <S {...p}>
    <path d="M12 6.5C10 5 7.5 4.5 4 4.8v13.5c3.5-.3 6 .2 8 1.7 2-1.5 4.5-2 8-1.7V4.8c-3.5-.3-6 .2-8 1.7Z" />
    <path d="M12 6.5V20" />
  </S>
);
export const Candles = (p: P) => (
  <S {...p}>
    <path d="M8 10v10M16 10v10M5.5 20h13" />
    <path d="M8 3.5c1 1.2 1.2 2.3.6 3.2-.4.6-1.2.6-1.5-.1-.3-.7.1-1.8.9-3.1ZM16 3.5c1 1.2 1.2 2.3.6 3.2-.4.6-1.2.6-1.5-.1-.3-.7.1-1.8.9-3.1Z" />
  </S>
);
export const Dots = (p: P) => (
  <S {...p}>
    <circle cx="5.5" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1.2" fill="currentColor" />
  </S>
);
export const Search = (p: P) => (
  <S {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 4.5 4.5" />
  </S>
);
export const Barcode = (p: P) => (
  <S {...p}>
    <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" />
    <path d="M8 8v8M11 8v8M13.5 8v8M16 8v8" />
  </S>
);
export const Close = (p: P) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);
export const Back = (p: P) => (
  <S {...p}>
    <path d="M9 5l7 7-7 7" />
  </S>
);
export const Chevron = (p: P) => (
  <S {...p}>
    <path d="M15 5l-7 7 7 7" />
  </S>
);
export const Speaker = (p: P) => (
  <S {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </S>
);
export const Question = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4" />
    <circle cx="12" cy="16.8" r=".6" fill="currentColor" />
  </S>
);
export const Printer = (p: P) => (
  <S {...p}>
    <path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
    <path d="M7 14h10v6H7z" />
  </S>
);
export const Sparkle = (p: P) => (
  <S {...p}>
    <path d="M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2Z" />
  </S>
);
export const Flag = (p: P) => (
  <S {...p}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </S>
);
export const Plus = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);
export const Scroll = (p: P) => (
  <S {...p}>
    <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7" />
    <path d="M7 4a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2ZM7 20a2 2 0 0 1-2-2v-1h4" />
    <path d="M11 9h5M11 12.5h5M11 16h3" />
  </S>
);
export const Info = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5" />
    <circle cx="12" cy="8" r=".6" fill="currentColor" />
  </S>
);
export const Check = (p: P) => (
  <S {...p}>
    <path d="M5 12.5 10 17.5 19 7" />
  </S>
);
export const Star = (p: P) => (
  <S {...p}>
    <path d="m12 4 2.4 5 5.4.7-4 3.7 1 5.4L12 16.2 7.2 18.8l1-5.4-4-3.7 5.4-.7Z" />
  </S>
);
export const Child = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="7" r="3" />
    <path d="M6 20c.5-4 2.8-6.5 6-6.5s5.5 2.5 6 6.5" />
  </S>
);
export const Bolt = (p: P) => (
  <S {...p}>
    <path d="M13 3 5.5 13.5H11L10 21l8-11h-5.5Z" />
  </S>
);
export const Alert = (p: P) => (
  <S {...p}>
    <path d="M12 4 21 19.5H3Z" />
    <path d="M12 10v4.5" />
    <circle cx="12" cy="17" r=".6" fill="currentColor" />
  </S>
);
export const Download = (p: P) => (
  <S {...p}>
    <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
  </S>
);
export const Sun = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </S>
);
export const Sunset = (p: P) => (
  <S {...p}>
    <path d="M7 16a5 5 0 0 1 10 0M3 16h18M5 20h14M12 4v4M5.6 9.6l1.4 1.4M18.4 9.6 17 11" />
  </S>
);
export const Cup = (p: P) => (
  <S {...p}>
    <path d="M7 4h10l-.8 6a4.2 4.2 0 0 1-8.4 0Z" />
    <path d="M12 14.5V20M8.5 20h7" />
  </S>
);
export const Shofar = (p: P) => (
  <S {...p}>
    <path d="M4 17c5 0 9-2 12-7l2.5-4.5c.5-.9 1.8-.4 1.5.6C18.5 13 14 19.5 4 19.5Z" />
    <path d="M4 17v2.5" />
  </S>
);
export const Sukka = (p: P) => (
  <S {...p}>
    <path d="M4 20V10M20 20V10M4 20h16" />
    <path d="M3 10c2-1.5 3.5-1.5 5 0 1.5-1.5 3.5-1.5 5 0 1.5-1.5 3.5-1.5 5 0 1-.8 2-1 3 0" />
    <path d="M9 20v-5h6v5" />
  </S>
);
export const Tree = (p: P) => (
  <S {...p}>
    <path d="M12 21v-6" />
    <path d="M12 15c-4.5 0-7-2.5-7-5.5S7.5 4 12 4s7 2.5 7 5.5-2.5 5.5-7 5.5Z" />
    <path d="M9 21h6" />
  </S>
);
export const Rice = (p: P) => (
  <S {...p}>
    <path d="M4 12h16a8 8 0 0 1-16 0Z" />
    <path d="M8 9.5c0-1 .6-1.6 1.3-1.6M11.5 9c0-1.2.7-2 1.5-2M15 9.5c0-1 .6-1.6 1.2-1.6" />
  </S>
);
export const Cake = (p: P) => (
  <S {...p}>
    <path d="M4 20h16v-7a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 4 13Z" />
    <path d="M4 15.5c1.6 1.2 3.2 1.2 4.8 0s3.2-1.2 4.8 0 3.2 1.2 4.8 0" />
    <path d="M12 11.5V8M12 5.5v.2" />
  </S>
);
export const Pot = (p: P) => (
  <S {...p}>
    <path d="M5 10h14v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
    <path d="M3 10h18M9 6.5c0-1 1-1 1-2M14 6.5c0-1 1-1 1-2" />
  </S>
);
export const Camera = (p: P) => (
  <S {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z" />
    <circle cx="12" cy="13" r="3.5" />
  </S>
);
export const Keyboard = (p: P) => (
  <S {...p}>
    <rect x="3" y="6.5" width="18" height="11" rx="2" />
    <path d="M7 10h.01M10.5 10h.01M14 10h.01M17 10h.01M7 13.5h.01M17 13.5h.01M9.5 14h5" />
  </S>
);

export const EVENT_ICONS: Record<string, (p: P) => ReactNode> = {
  candles: Candles,
  sun: Sun,
  sunset: Sunset,
  cup: Cup,
  shofar: Shofar,
  sukka: Sukka,
  tree: Tree,
};

export const ICONS: Record<string, (p: P) => ReactNode> = {
  ...BLESSING_ICONS,
  rice: Rice,
  cake: Cake,
  pot: Pot,
};

export function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-label="מה מברכים">
      <rect width="512" height="512" rx="112" fill="#5B6B2E" />
      <path
        d="M286 153.3 A136 136 0 1 1 160 382 L126 432 L130 334 A136 136 0 0 1 226 153.3 M226 153.3 L218 104 L242 126 L256 96 L270 126 L294 104 L286 153.3"
        fill="none"
        stroke="#FBF6EC"
        strokeWidth="26"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="204" cy="290" r="17" fill="#FBF6EC" />
      <circle cx="256" cy="290" r="17" fill="#FBF6EC" />
      <circle cx="308" cy="290" r="17" fill="#FBF6EC" />
    </svg>
  );
}
