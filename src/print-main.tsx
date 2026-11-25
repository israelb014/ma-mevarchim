import { createRoot } from 'react-dom/client';
import './fonts';
import './styles/app.css';
import { Sheet } from './components/Sheet';
import { bundledContent, loadContent } from './lib/content';
import { lockState } from './lib/shabbat';
import type { Nusach } from './lib/types';
import { Logo } from './components/Icons';

const q = new URLSearchParams(location.search);
const event = q.get('event') ?? 'leil-shabbat';
const nusach: Nusach = q.get('nusach') === 'ashkenaz' ? 'ashkenaz' : 'sefaradi';
const root = createRoot(document.getElementById('root')!);

(async () => {
  if (lockState(new Date()).locked) {
    root.render(
      <div className="lock">
        <div>
          <h1>שבת שלום</h1>
        </div>
      </div>
    );
    return;
  }
  const content = await loadContent().catch(() => bundledContent());
  root.render(
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24, background: '#fff', minHeight: '100vh' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <Logo size={48} />
      </div>
      <Sheet content={content} eventId={event} nusach={nusach} />
    </div>
  );
  setTimeout(() => window.print(), 700);
})();
