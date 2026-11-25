import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as db from './lib/db';
import { bundledContent, loadContent, refreshContent } from './lib/content';
import { buildIndex, type SearchIndex } from './lib/search';
import type { Content, Nusach } from './lib/types';

interface AppState {
  ready: boolean;
  content: Content;
  index: SearchIndex;
  nusach: Nusach | null;
  recents: string[];
  barcodes: Record<string, string>;
  progress: Record<string, number>;
  setNusach: (n: Nusach) => void;
  addRecent: (id: string) => void;
  linkBarcode: (code: string, id: string) => void;
  recordAnswer: (ruleId: string, correct: boolean) => void;
  resetProgress: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(bundledContent);
  const [ready, setReady] = useState(false);
  const [nusach, setNusachS] = useState<Nusach | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [barcodes, setBarcodes] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [c, n, r, b, p] = await Promise.all([
        loadContent(),
        db.get<Nusach>('nusach'),
        db.get<string[]>('recents'),
        db.get<Record<string, string>>('barcodes'),
        db.get<Record<string, number>>('progress'),
      ]);
      setContent(c);
      setNusachS(n ?? null);
      setRecents(r ?? []);
      setBarcodes(b ?? {});
      setProgress(p ?? {});
      setReady(true);
      const fresh = await refreshContent(c);
      if (fresh) setContent(fresh);
    })();
  }, []);

  const index = useMemo(() => buildIndex(content.products), [content]);

  const setNusach = useCallback((n: Nusach) => {
    setNusachS(n);
    db.set('nusach', n);
  }, []);
  const addRecent = useCallback((id: string) => {
    setRecents((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 8);
      db.set('recents', next);
      return next;
    });
  }, []);
  const linkBarcode = useCallback((code: string, id: string) => {
    setBarcodes((prev) => {
      const next = { ...prev, [code]: id };
      db.set('barcodes', next);
      return next;
    });
  }, []);
  const recordAnswer = useCallback((ruleId: string, correct: boolean) => {
    if (!correct) return;
    setProgress((prev) => {
      const next = { ...prev, [ruleId]: (prev[ruleId] ?? 0) + 1 };
      db.set('progress', next);
      return next;
    });
  }, []);
  const resetProgress = useCallback(() => {
    setProgress({});
    db.set('progress', {});
  }, []);

  const value: AppState = { ready, content, index, nusach, recents, barcodes, progress, setNusach, addRecent, linkBarcode, recordAnswer, resetProgress };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('no provider');
  return v;
}
