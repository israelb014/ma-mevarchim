import { useEffect, useState } from 'react';

export interface Route {
  name: string;
  arg?: string;
  query: URLSearchParams;
}

export function parse(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const [path, qs = ''] = h.split('?');
  const [name = 'home', arg] = path.split('/').map(decodeURIComponent);
  return { name: name || 'home', arg, query: new URLSearchParams(qs) };
}

let depth = 0;
let goingBack = false;

export function go(path: string, replace = false) {
  const url = '#/' + path.replace(/^\/+/, '');
  if (replace) {
    history.replaceState(null, '', url);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    depth = Math.max(0, depth - 1);
  } else location.hash = url;
}

export function back(fallback = 'home') {
  if (depth > 0) {
    goingBack = true;
    history.back();
  } else go(fallback, true);
}

export function useRoute(): Route {
  const [r, setR] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => {
      if (goingBack) {
        depth = Math.max(0, depth - 1);
        goingBack = false;
      } else depth++;
      setR(parse(location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}
