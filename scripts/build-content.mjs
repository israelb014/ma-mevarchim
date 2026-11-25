// Builds public/data/*.json and CONTENT_REVIEW.md from scripts/content/*.mjs
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { blessings, rules } from './content/rules.mjs';
import { products as groups, categories } from './content/products.mjs';
import { events, extraBlessings } from './content/events.mjs';

const ruleById = Object.fromEntries(rules.map((r) => [r.id, r]));
const FIRST = blessings.first;
const LAST = blessings.last;

const defaultWhy = {
  'tree-fruit': () => `פרי שגדל על עץ שגזעו נשאר משנה לשנה – לכן בורא פרי העץ.`,
  'ground-fruit': () => `גדל מהאדמה על צמח שאינו עץ – לכן בורא פרי האדמה.`,
  bread: () => `לחם מחמשת מיני דגן – מברכים המוציא ובסוף ברכת המזון.`,
  'five-grains': () => `עשוי מחמשת מיני דגן ואינו לחם – לכן מזונות ועל המחיה.`,
  'pat-habaa': () => `מאפה שאינו לחם רגיל – מזונות, אבל מי שאוכל ממנו כמות של ארוחה מברך המוציא.`,
  rice: () => `אורז מבושל – מזונות, אבל הברכה האחרונה בורא נפשות כי אינו מחמשת מיני דגן.`,
  shehakol: () => `לא גדל ישירות מהאדמה או שעבר עיבוד שאין בו צורת פרי – לכן שהכל.`,
  wine: () => `יין ומיץ ענבים קיבלו ברכה מיוחדת – בורא פרי הגפן.`,
  juice: () => `מיץ שיוצא מפרי נחשב משקה ולא פרי – לכן שהכל.`,
  water: () => `על מים מברכים שהכל, ורק כששותים לצמא.`,
  'shinui-tzura': () => `בישול, ייבוש או אפייה לא משנים את הברכה כל עוד המאכל ניכר.`,
  crushed: () => `מרוסק אבל זו הדרך הרגילה לאוכלו – לכן הברכה נשארת.`,
  'ikar-tafel': () => `מברכים על הרכיב העיקרי, והשאר טפל לו.`,
  kdima: () => `מברכים על כל סוג לפי ברכתו, ומקדימים את הברכה החשובה.`,
  safek: () => `יש מחלוקת בברכה – בספק מברכים שהכל.`,
};

const errors = [];
const products = [];
const seen = new Set();
for (const [cat, rows] of Object.entries(groups)) {
  for (const [id, name, syn, first, last, rule_id, o = {}] of rows) {
    if (seen.has(id)) errors.push(`duplicate id ${id}`);
    seen.add(id);
    if (!FIRST[first]) errors.push(`${id}: bad first ${first}`);
    if (!LAST[last]) errors.push(`${id}: bad last ${last}`);
    const rule = ruleById[rule_id];
    if (!rule) errors.push(`${id}: bad rule ${rule_id}`);
    const why = o.why ?? defaultWhy[rule_id]?.();
    if (!why) errors.push(`${id}: no why`);
    const item = {
      id,
      name,
      synonyms: syn ? syn.split('|') : [],
      ...(o.brand ? { brand: o.brand } : {}),
      category: cat,
      first,
      last,
      rule_id,
      why,
      source: o.source ?? rule?.source,
      ...(o.note ? { note: o.note } : {}),
      ...(o.diff ? { nusach_diff: o.diff } : {}),
      doubt: !!o.doubt,
    };
    products.push(item);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const dv = existsSync('public/data/data-version.json')
  ? JSON.parse(readFileSync('public/data/data-version.json', 'utf8'))
  : { version: 0 };
const payload = {
  rules: { blessings, rules },
  products: { categories, products },
  events: { events },
  'extra-blessings': { blessings: extraBlessings },
};
let changed = false;
for (const [name, data] of Object.entries(payload)) {
  const path = `public/data/${name}.json`;
  const json = JSON.stringify(data, null, 1) + '\n';
  if (!existsSync(path) || readFileSync(path, 'utf8') !== json) {
    writeFileSync(path, json);
    changed = true;
  }
}
if (changed || !dv.version) {
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(
    'public/data/data-version.json',
    JSON.stringify({ version: (dv.version || 0) + 1, updated: today }, null, 1) + '\n'
  );
}

// Review file
const doubts = products.filter((p) => p.doubt);
const diffs = products.filter((p) => p.nusach_diff);
const fn = (k) => FIRST[k].name;
const ln = (k) => LAST[k].name;
let md = `# סקירת תוכן – "מה מברכים"\n\nקובץ זה נוצר אוטומטית (scripts/build-content.mjs). יש לעבור על כל הפריטים כאן לפני שמסתמכים עליהם.\n\n`;
md += `סה"כ פריטים: ${products.length} · מסומנים ספק: ${doubts.length} · עם הבדלי עדות: ${diffs.length}\n\n`;
md += `## פריטים מסומנים ספק (${doubts.length})\n\n| מזהה | שם | ברכה ראשונה | ברכה אחרונה | הסבר |\n|---|---|---|---|---|\n`;
for (const p of doubts) md += `| ${p.id} | ${p.name} | ${fn(p.first)} | ${ln(p.last)} | ${p.why} |\n`;
md += `\n## פריטים עם הבדל בין העדות (${diffs.length})\n\n| מזהה | שם | ספרדים | אשכנזים | הבדל |\n|---|---|---|---|---|\n`;
for (const p of diffs) {
  const a = p.nusach_diff.ashkenaz ?? {};
  md += `| ${p.id} | ${p.name} | ${fn(p.first)} / ${ln(p.last)} | ${fn(a.first ?? p.first)} / ${ln(a.last ?? p.last)} | ${p.nusach_diff.text} |\n`;
}
md += `\n## הבדלי נוסח כלליים\n\n- ברכת הגפן: ספרדים "הַגֶּפֶן", אשכנזים "הַגָּפֶן".\n- שיעור רביעית: ספרדים כ-81 מ"ל, אשכנזים כ-86 מ"ל.\n- ליל הסדר: לפי השולחן ערוך מברכים הגפן רק על הכוס הראשונה והשלישית; לפי הרמ"א על כל ארבע הכוסות.\n- סדר קדימה (ט"ו בשבט): ספרדים – שבעת המינים קודמים; אשכנזים – הפרי החביב קודם.\n- ברכות הנהנין: הנוסח מוצג עם ה' ואֱלֹקֵינוּ כדי שלא לכתוב את השם המפורש על דף שעלול להיזרק.\n`;
writeFileSync('CONTENT_REVIEW.md', md);
console.log(`products: ${products.length}, rules: ${rules.length}, doubts: ${doubts.length}, diffs: ${diffs.length}`);
