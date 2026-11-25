import { resolveFor } from './content';
import type { Content, FirstKey, Nusach } from './types';

export interface Question {
  text: string;
  options: string[];
  answer: number;
  rule_id: string;
  productId?: string;
  blessingKeys?: FirstKey[];
}

const FIRSTS: FirstKey[] = ['hamotzi', 'mezonot', 'hagafen', 'haetz', 'haadama', 'shehakol'];

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function productQuestion(c: Content, productId: string, nusach: Nusach, rnd = Math.random): Question {
  const p = c.products.find((x) => x.id === productId)!;
  const correct = resolveFor(p, nusach).first;
  const wrong = shuffle(FIRSTS.filter((f) => f !== correct), rnd).slice(0, 3);
  const keys = shuffle([correct, ...wrong], rnd);
  return {
    text: `מה מברכים על ${p.name}?`,
    options: keys.map((k) => c.blessings.first[k].name),
    blessingKeys: keys,
    answer: keys.indexOf(correct),
    rule_id: p.rule_id,
    productId: p.id,
  };
}

/** Builds a quick quiz: products from "my products" first, plus rule questions for unlearned rules. */
export function buildQuiz(
  c: Content,
  nusach: Nusach,
  recentIds: string[],
  progress: Record<string, number>,
  count = 5,
  rnd = Math.random
): Question[] {
  const eligible = (id: string) => {
    const p = c.products.find((x) => x.id === id);
    return p && !p.doubt;
  };
  const mine = shuffle(recentIds.filter(eligible), rnd);
  const others = shuffle(c.products.filter((p) => !p.doubt && !recentIds.includes(p.id)).map((p) => p.id), rnd);
  const productIds = [...mine, ...others].slice(0, Math.ceil(count * 0.6));
  const qs: Question[] = productIds.map((id) => productQuestion(c, id, nusach, rnd));
  const rules = shuffle(c.rules, rnd).sort((a, b) => (progress[a.id] ?? 0) - (progress[b.id] ?? 0));
  for (const r of rules) {
    if (qs.length >= count) break;
    const item = r.quiz[Math.floor(rnd() * r.quiz.length)];
    qs.push({ text: item.q, options: item.options, answer: item.answer, rule_id: r.id });
  }
  return shuffle(qs, rnd).slice(0, count);
}

export const LEARNED_AT = 3;
export const isLearned = (progress: Record<string, number>, ruleId: string) => (progress[ruleId] ?? 0) >= LEARNED_AT;
