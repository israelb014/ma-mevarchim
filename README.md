# מה מברכים

אפליקציה בעברית שמלמדת איזו ברכה מברכים על אוכל ושתייה.

- אתר: https://israelb014.github.io/ma-mevarchim/
- הורדות (APK / Windows / Linux): https://github.com/israelb014/ma-mevarchim/releases/latest

## פיתוח

```bash
npm install
npm run dev        # שרת פיתוח
npm test           # בדיקות
npm run build      # בניית האתר ל-dist
```

## תוכן

מקור האמת לתוכן נמצא ב-`scripts/content/*.mjs`. אחרי עריכה:

```bash
node scripts/build-content.mjs
```

הפקודה מייצרת את `public/data/*.json`, מעלה את `data-version.json` ומעדכנת את `CONTENT_REVIEW.md`.
אפליקציות מותקנות מורידות את התוכן החדש בהפעלה הבאה.

## עדכונים

- קוד ועיצוב באנדרואיד מתעדכנים לבד דרך `bundle.zip` ו-`app-version.json` ב-Pages.
- שינוי נייטיב (הרשאות, תוספים) או במעטפת Electron: מעלים את המספר המתאים ב-`native-levels.json`, ואז מוצג למשתמשים באנר "יש גרסה חדשה להתקנה".
