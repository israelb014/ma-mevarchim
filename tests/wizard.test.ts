import { describe, expect, it } from 'vitest';
import { walk, NODES, START } from '../src/lib/wizard';
import { bundledContent } from '../src/lib/content';

describe('wizard', () => {
  it('starts with the grain question', () => {
    const s = walk([]);
    expect(s.done).toBe(false);
    if (!s.done) expect(s.node.id).toBe(START);
  });
  it('bread → hamotzi / birkat hamazon', () => {
    const s = walk([0, 0]);
    expect(s.done && s.result).toMatchObject({ first: 'hamotzi', last: 'bh' });
  });
  it('pastry snack → mezonot, meal → hamotzi', () => {
    expect(walk([0, 1, 0])).toMatchObject({ done: true, result: { first: 'mezonot', last: 'michya' } });
    expect(walk([0, 1, 1])).toMatchObject({ done: true, result: { first: 'hamotzi', last: 'bh' } });
  });
  it('orange juice → shehakol', () => {
    expect(walk([1, 0, 0])).toMatchObject({ done: true, result: { first: 'shehakol', last: 'nefashot', rule_id: 'juice' } });
  });
  it('dates → haetz / al haetz; apple → haetz / nefashot', () => {
    expect(walk([1, 0, 1, 0])).toMatchObject({ done: true, result: { first: 'haetz', last: 'etz' } });
    expect(walk([1, 0, 1, 1])).toMatchObject({ done: true, result: { first: 'haetz', last: 'nefashot' } });
  });
  it('wine → hagafen', () => {
    expect(walk([1, 1, 0])).toMatchObject({ done: true, result: { first: 'hagafen', last: 'gefen' } });
  });
  it('rice → mezonot / nefashot', () => {
    expect(walk([1, 3, 1])).toMatchObject({ done: true, result: { first: 'mezonot', last: 'nefashot' } });
  });
  it('mashed vegetables keep haadama; fully ground is doubtful', () => {
    expect(walk([1, 2, 2])).toMatchObject({ done: true, result: { first: 'haadama' } });
    expect(walk([1, 2, 3])).toMatchObject({ done: true, result: { first: 'shehakol', doubt: true } });
  });
  it('records the path for the explanation', () => {
    const s = walk([1, 4]);
    expect(s.done).toBe(true);
    expect(s.path).toHaveLength(2);
  });
  it('every option leads somewhere valid, every result rule exists, max 4 questions', () => {
    const rules = new Set(bundledContent().rules.map((r) => r.id));
    const depth = (id: string, d: number): number => {
      const n = NODES[id];
      expect(n).toBeTruthy();
      return Math.max(
        ...n.options.map((o) => {
          if (o.result) {
            expect(rules.has(o.result.rule_id)).toBe(true);
            return d;
          }
          return depth(o.next!, d + 1);
        })
      );
    };
    expect(depth(START, 1)).toBeLessThanOrEqual(4);
  });
  it('throws on invalid answers', () => {
    expect(() => walk([9])).toThrow();
  });
});
