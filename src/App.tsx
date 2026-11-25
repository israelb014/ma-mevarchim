import { useEffect, useState } from 'react';
import { useApp } from './state';
import { useRoute } from './lib/router';
import { BottomNav } from './components/ui';
import { LockScreen, useLock } from './components/Lock';
import { Download, Logo } from './components/Icons';
import { Home } from './screens/Home';
import { ProductScreen } from './screens/Result';
import { Scan } from './screens/Scan';
import { Wizard } from './screens/Wizard';
import { Kids, Learn, Quiz, RuleScreen } from './screens/Learn';
import { Shabbat } from './screens/Shabbat';
import { About, Extra, More, Onboarding, Sources } from './screens/More';
import { checkShellUpdate, nativeLiveUpdate, type ShellUpdate } from './lib/updates';
import { setupNotifications } from './lib/notifications';
import { openExternal } from './lib/platform';

function UpdateBanner() {
  const [u, setU] = useState<ShellUpdate | null>(null);
  useEffect(() => {
    checkShellUpdate().then(setU);
  }, []);
  if (!u) return null;
  return (
    <div className="banner">
      <Download />
      <span className="grow">יש גרסה חדשה להתקנה</span>
      <button onClick={() => openExternal(u.url)}>הורדה</button>
    </div>
  );
}

export function App() {
  const { ready, nusach } = useApp();
  const route = useRoute();
  const lock = useLock();

  useEffect(() => {
    nativeLiveUpdate();
    setupNotifications();
  }, []);

  if (lock.locked) return <LockScreen s={lock} />;
  if (!ready)
    return (
      <div className="splash">
        <div>
          <Logo size={110} />
        </div>
      </div>
    );
  if (!nusach)
    return (
      <div className="app no-nav">
        <Onboarding />
      </div>
    );

  let screen;
  switch (route.name) {
    case 'product':
      screen = <ProductScreen id={route.arg} />;
      break;
    case 'scan':
      screen = <Scan />;
      break;
    case 'wizard':
      screen = <Wizard key={route.arg} />;
      break;
    case 'learn':
      screen = <Learn />;
      break;
    case 'rule':
      screen = <RuleScreen id={route.arg} />;
      break;
    case 'quiz':
      screen = <Quiz />;
      break;
    case 'kids':
      screen = <Kids />;
      break;
    case 'shabbat':
      screen = <Shabbat event={route.query.get('event')} />;
      break;
    case 'more':
      screen = <More />;
      break;
    case 'extra':
      screen = <Extra />;
      break;
    case 'sources':
      screen = <Sources />;
      break;
    case 'about':
      screen = <About />;
      break;
    default:
      screen = <Home />;
  }
  return (
    <>
      <div className="app" key={route.name + (route.arg ?? '')}>
        <UpdateBanner />
        {screen}
      </div>
      <BottomNav route={route.name} />
    </>
  );
}
