import type { FirstKey, LastKey } from './types';

export interface WizardResult {
  first: FirstKey;
  last: LastKey;
  rule_id: string;
  doubt?: boolean;
  note?: string;
}
export interface WizardOption {
  label: string;
  hint?: string;
  icon?: string;
  next?: string;
  result?: WizardResult;
}
export interface WizardNode {
  id: string;
  question: string;
  help?: string;
  options: WizardOption[];
}

const R = (first: FirstKey, last: LastKey, rule_id: string, extra: Partial<WizardResult> = {}): WizardResult => ({ first, last, rule_id, ...extra });

export const UNKNOWN_RESULT = R('shehakol', 'nefashot', 'safek', {
  doubt: true,
  note: `כשלא יודעים ממה המוצר עשוי – מברכים שהכל, שפוטרת בדיעבד את הכול. כדאי לבדוק את רשימת הרכיבים או לשאול רב.`,
});

export const NODES: Record<string, WizardNode> = {
  grain: {
    id: 'grain',
    question: `יש במוצר קמח או דגן מחמשת מיני דגן?`,
    help: `חיטה, שעורה, כוסמין, שיבולת שועל או שיפון – לא רק כחומר מדביק`,
    options: [
      { label: `כן`, icon: 'wheat', next: 'grainType' },
      { label: `לא`, icon: 'leaf', next: 'base' },
    ],
  },
  grainType: {
    id: 'grainType',
    question: `איזה סוג מאכל זה?`,
    options: [
      { label: `לחם רגיל`, hint: `לחם, פיתה, חלה, לחמנייה`, icon: 'bread', result: R('hamotzi', 'bh', 'bread') },
      { label: `מאפה מתוק, ממולא או פריך`, hint: `עוגה, בורקס, עוגיות, קרקר`, icon: 'cake', next: 'kvius' },
      { label: `מבושל או מטוגן`, hint: `פסטה, דייסה, קוסקוס, סופגנייה`, icon: 'pot', result: R('mezonot', 'michya', 'five-grains') },
      { label: `משקה`, hint: `בירה, משקה דגנים`, icon: 'drop', result: R('shehakol', 'nefashot', 'shehakol') },
    ],
  },
  kvius: {
    id: 'kvius',
    question: `אוכלים ממנו כמות של ארוחה?`,
    help: `בערך 216 גרם ומעלה, כמות שאנשים שבעים ממנה`,
    options: [
      { label: `לא, רק נשנוש`, result: R('mezonot', 'michya', 'pat-habaa') },
      { label: `כן, כמו ארוחה`, result: R('hamotzi', 'bh', 'pat-habaa', { note: `בקביעת סעודה נוטלים ידיים ומברכים המוציא וברכת המזון.` }) },
    ],
  },
  base: {
    id: 'base',
    question: `ממה עשוי המוצר ברובו?`,
    options: [
      { label: `פרי עץ`, hint: `תפוח, תפוז, תמר, אגוזים`, icon: 'leaf', next: 'fruitForm' },
      { label: `ענבים`, icon: 'grapes', next: 'grape' },
      { label: `ירק, קטנייה או פרי אדמה`, hint: `גזר, תירס, בננה, תות שדה`, icon: 'sprout', next: 'vegForm' },
      { label: `אורז`, icon: 'rice', next: 'riceDrink' },
      { label: `משהו אחר`, hint: `בשר, חלב, ביצים, סוכר, פטריות`, icon: 'drop', result: R('shehakol', 'nefashot', 'shehakol') },
    ],
  },
  grape: {
    id: 'grape',
    question: `זה יין או מיץ ענבים?`,
    options: [
      { label: `כן, יין או מיץ`, icon: 'grapes', result: R('hagafen', 'gefen', 'wine') },
      { label: `לא, אוכלים את הענבים`, icon: 'leaf', result: R('haetz', 'etz', 'tree-fruit') },
    ],
  },
  fruitForm: {
    id: 'fruitForm',
    question: `באיזו צורה הפרי?`,
    options: [
      { label: `משקה או מיץ`, icon: 'drop', result: R('shehakol', 'nefashot', 'juice') },
      { label: `הפרי ניכר, או מרוסק כדרכו`, hint: `שלם, חתוך, מבושל, מיובש, ממרח תמרים`, icon: 'leaf', next: 'seven' },
      { label: `טחון לגמרי ואין לו צורה`, result: R('shehakol', 'nefashot', 'crushed', { doubt: true, note: `בפרי שנטחן לגמרי יש מחלוקת. בספק – שהכל.` }) },
    ],
  },
  seven: {
    id: 'seven',
    question: `זה תמר, תאנה, רימון או זית?`,
    help: `פירות משבעת המינים`,
    options: [
      { label: `כן`, result: R('haetz', 'etz', 'tree-fruit') },
      { label: `לא`, result: R('haetz', 'nefashot', 'tree-fruit') },
    ],
  },
  vegForm: {
    id: 'vegForm',
    question: `באיזו צורה הוא?`,
    options: [
      { label: `משקה או מיץ`, icon: 'drop', result: R('shehakol', 'nefashot', 'juice') },
      { label: `ניכר – חי, מבושל או אפוי`, icon: 'sprout', result: R('haadama', 'nefashot', 'ground-fruit') },
      { label: `מרוסק, וכך רגילים לאכול אותו`, hint: `פירה, מרק טחון`, result: R('haadama', 'nefashot', 'crushed') },
      { label: `טחון לגמרי ואין לו צורה`, hint: `חטיף מתירס טחון`, result: R('shehakol', 'nefashot', 'crushed', { doubt: true, note: `בירק שנטחן לגמרי יש מחלוקת. בספק – שהכל.` }) },
    ],
  },
  riceDrink: {
    id: 'riceDrink',
    question: `זה משקה?`,
    options: [
      { label: `כן, כמו חלב אורז`, icon: 'drop', result: R('shehakol', 'nefashot', 'shehakol') },
      { label: `לא, אורז מבושל`, icon: 'rice', result: R('mezonot', 'nefashot', 'rice') },
    ],
  },
};

export const START = 'grain';

export type WizardState =
  | { done: false; node: WizardNode; step: number; path: { question: string; answer: string }[] }
  | { done: true; result: WizardResult; path: { question: string; answer: string }[] };

/** Walks the decision tree with a list of chosen option indexes. */
export function walk(answers: number[]): WizardState {
  let node = NODES[START];
  const path: { question: string; answer: string }[] = [];
  for (const a of answers) {
    const opt = node.options[a];
    if (!opt) throw new Error(`bad answer ${a} at ${node.id}`);
    path.push({ question: node.question, answer: opt.label });
    if (opt.result) return { done: true, result: opt.result, path };
    node = NODES[opt.next!];
  }
  return { done: false, node, step: answers.length, path };
}
