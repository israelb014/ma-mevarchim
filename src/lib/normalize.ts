const FINALS: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

/** Normalizes Hebrew text for search: strips nikud/cantillation, final letters, spaces, punctuation. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[֑-ׇ]/g, '')
    .replace(/[ךםןףץ]/g, (c) => FINALS[c])
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/** Splits into normalized words (for multi-word queries). */
export function words(s: string): string[] {
  return s
    .split(/[\s\-–—_/,.]+/)
    .map(normalize)
    .filter(Boolean);
}

/** Optimal string alignment distance (Damerau-Levenshtein with adjacent transpositions). */
export function osa(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = [];
  for (let i = 0; i <= a.length; i++) d[i] = [i];
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2][j - 2] + 1);
      d[i][j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}
