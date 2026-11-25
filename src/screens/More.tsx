import { useApp } from '../state';
import { go } from '../lib/router';
import { APP_VERSION, BUILD_DATE, openExternal, whatsappUrl } from '../lib/platform';
import { Chevron, Flag, Info, Logo, Plus, Scroll, Sparkle } from '../components/Icons';
import { TopBar } from '../components/ui';
import type { Nusach } from '../lib/types';

export function NusachPicker() {
  const { nusach, setNusach } = useApp();
  const opts: [Nusach, string][] = [
    ['sefaradi', 'עדות המזרח'],
    ['ashkenaz', 'אשכנז'],
  ];
  return (
    <div className="seg">
      {opts.map(([k, l]) => (
        <button key={k} className={(nusach ?? 'sefaradi') === k ? 'on' : ''} onClick={() => setNusach(k)} aria-pressed={nusach === k}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function More() {
  const rows = [
    { label: 'ברכות נוספות', Icon: Sparkle, on: () => go('extra') },
    {
      label: 'דיווח על טעות',
      Icon: Flag,
      on: () => openExternal(whatsappUrl(`דיווח על טעות באפליקציית "מה מברכים"\nמסך: עוד\nגרסה: ${APP_VERSION}\n\nפירוט:`)),
    },
    {
      label: 'הוספת מוצר חסר',
      Icon: Plus,
      on: () => openExternal(whatsappUrl(`בקשה להוספת מוצר לאפליקציית "מה מברכים"\nשם המוצר:\nמותג:\nגרסה: ${APP_VERSION}`)),
    },
    { label: 'מקורות', Icon: Scroll, on: () => go('sources') },
    { label: 'אודות', Icon: Info, on: () => go('about') },
  ];
  return (
    <>
      <h1 className="h-display fade-up">עוד</h1>
      <div className="card fade-up d1">
        <div className="card-title">הנוסח שלי</div>
        <p className="muted small" style={{ marginTop: 0 }}>
          הברכות, ההבדלים ודפי ההדפסה מותאמים לנוסח.
        </p>
        <NusachPicker />
      </div>
      <div className="card fade-up d2">
        <ul className="list">
          {rows.map(({ label, Icon, on }) => (
            <li key={label}>
              <button className="list-item" onClick={on}>
                <Icon size={22} style={{ color: 'var(--olive)' }} />
                <span className="grow">{label}</span>
                <Chevron className="chev" size={20} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function Extra() {
  const { content } = useApp();
  return (
    <>
      <TopBar />
      <h1 className="h-title">ברכות נוספות</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        ברכות הראייה והשמיעה, שהחיינו ובגד חדש.
      </p>
      {content.extra.map((b, i) => (
        <div key={b.id} className="card fade-up" style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}>
          <div className="card-title">{b.title}</div>
          <div className="muted small">{b.when}</div>
          <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.6, marginTop: 8 }}>{b.text}</div>
          {b.note && <div className="small muted" style={{ marginTop: 6 }}>{b.note}</div>}
        </div>
      ))}
    </>
  );
}

export function Sources() {
  const { content } = useApp();
  return (
    <>
      <TopBar />
      <h1 className="h-title">מקורות</h1>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          <b>עדות המזרח:</b> לפי פסקי מרן השולחן ערוך, ילקוט יוסף ופסקי הרב עובדיה יוסף זצ"ל.
        </p>
        <p>
          <b>אשכנז:</b> לפי פסקי הרמ"א והמשנה ברורה.
        </p>
        <p style={{ marginBottom: 0 }} className="muted small">
          האפליקציה נועדה ללימוד ולהכוונה. במוצרים שמסומנים "ספק" ובכל שאלה – כדאי לשאול רב. הרכב מוצרים עשוי להשתנות; בדקו את רשימת הרכיבים.
        </p>
      </div>
      <div className="card">
        <div className="card-title">מקורות הכללים</div>
        <ul className="list">
          {content.rules.map((r) => (
            <li key={r.id} className="list-item" style={{ display: 'block' }}>
              {r.title}
              <span className="sub">{r.source}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function About() {
  const { content } = useApp();
  return (
    <>
      <TopBar />
      <div className="center fade-up" style={{ marginTop: 20 }}>
        <Logo size={96} />
        <h1 className="h-title" style={{ marginTop: 16 }}>
          מה מברכים
        </h1>
        <p className="muted">לומדים את הכללים – ומברכים בביטחון.</p>
      </div>
      <div className="card">
        <ul className="list">
          <li className="list-item">
            <span className="grow">גרסה</span>
            <b dir="ltr">{APP_VERSION}</b>
          </li>
          <li className="list-item">
            <span className="grow">תאריך בנייה</span>
            <b dir="ltr">{BUILD_DATE}</b>
          </li>
          <li className="list-item">
            <span className="grow">עדכון תוכן</span>
            <b dir="ltr">{content.updated}</b>
          </li>
          <li className="list-item">
            <span className="grow">גרסת תוכן</span>
            <b dir="ltr">{content.version}</b>
          </li>
          <li className="list-item">
            <span className="grow">מוצרים במאגר</span>
            <b>{content.products.length}</b>
          </li>
        </ul>
      </div>
      <p className="center small muted">כל המידע האישי נשמר רק על המכשיר שלכם.</p>
    </>
  );
}

export function Onboarding() {
  const { setNusach } = useApp();
  return (
    <div className="center" style={{ paddingTop: 40 }}>
      <div className="fade-up">
        <Logo size={104} />
      </div>
      <h1 className="h-display fade-up d1">ברוכים הבאים</h1>
      <p className="muted fade-up d2" style={{ fontSize: 19, marginTop: -6 }}>
        איזה נוסח אתם?
        <br />
        אפשר לשנות בכל רגע במסך "עוד".
      </p>
      <div className="fade-up d3" style={{ marginTop: 26 }}>
        <button className="option" style={{ justifyContent: 'center' }} onClick={() => setNusach('sefaradi')}>
          עדות המזרח
        </button>
        <button className="option" style={{ justifyContent: 'center' }} onClick={() => setNusach('ashkenaz')}>
          אשכנז
        </button>
      </div>
    </div>
  );
}
