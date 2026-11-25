export type FirstKey = 'hamotzi' | 'mezonot' | 'hagafen' | 'haetz' | 'haadama' | 'shehakol';
export type LastKey = 'bh' | 'michya' | 'gefen' | 'etz' | 'nefashot' | 'none';
export type Nusach = 'sefaradi' | 'ashkenaz';

export interface FirstBlessing {
  name: string;
  ending: string;
  ending_ashkenaz?: string;
  color: string;
  icon: string;
}
export interface LastBlessing {
  name: string;
  kind: 'bread' | 'food' | 'drink' | 'any' | 'none';
  desc: string;
}
export interface Blessings {
  prefix: string;
  prefix_spoken: string;
  first: Record<FirstKey, FirstBlessing>;
  last: Record<LastKey, LastBlessing>;
  shiur: Record<'food' | 'drink' | 'bread', Record<Nusach, string>>;
}
export interface QuizItem {
  q: string;
  options: string[];
  answer: number;
}
export interface Rule {
  id: string;
  title: string;
  short: string;
  explanation: string;
  examples: string[];
  blessing: FirstKey;
  source: string;
  quiz: QuizItem[];
}
export interface NusachDiff {
  ashkenaz?: { first?: FirstKey; last?: LastKey };
  text: string;
}
export interface Product {
  id: string;
  name: string;
  synonyms: string[];
  brand?: string;
  category: string;
  first: FirstKey;
  last: LastKey;
  rule_id: string;
  why: string;
  source: string;
  note?: string;
  nusach_diff?: NusachDiff;
  doubt: boolean;
}
export interface EventStep {
  title: string;
  blessing?: FirstKey;
  text?: string;
  note?: string;
}
export interface MealEvent {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  steps: Record<Nusach, EventStep[]>;
}
export interface ExtraBlessing {
  id: string;
  title: string;
  when: string;
  text: string;
  note?: string;
}
export interface Content {
  version: number;
  updated: string;
  blessings: Blessings;
  rules: Rule[];
  products: Product[];
  categories: Record<string, string>;
  events: MealEvent[];
  extra: ExtraBlessing[];
}
