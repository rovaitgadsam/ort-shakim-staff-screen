# התראות לטלפון על הודעות QR

האתר יכול לשלוח התראה ל-Telegram בכל פעם שמתקבלת הודעת QR חדשה שממתינה לאישור. ההתראה נשלחת מפונקציית Firebase בצד השרת; אסור לשמור את טוקן הבוט בקוד האתר או בקובץ ציבורי.

## דרישות

- Telegram מותקן בטלפון.
- פרויקט Firebase בתוכנית Blaze עם חשבון חיוב מקושר (Cloud Functions דורשות תוכנית זו).
- Node.js 22 וממשק שורת פקודה של Firebase במחשב שבו מבצעים את הפרסום.

## 1. יצירת בוט Telegram

1. ב-Telegram פתח את השיחה עם [@BotFather](https://t.me/BotFather).
2. שלח `/newbot` ופעל לפי ההוראות. בסיום יינתן לך **Bot Token**.
3. פתח את הקישור של הבוט החדש שיצרת ולחץ **Start**. שלח לו הודעה קצרה, למשל `בדיקה`.

**שמור את Bot Token בסוד. אל תשלח אותו בצ'אט ואל תוסיף אותו למאגר GitHub.**

## 2. מציאת Chat ID

פתח בדפדפן שלך את הכתובת הבאה, אחרי החלפת `YOUR_BOT_TOKEN` בטוקן שלך:

`https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`

בתשובת ה-JSON חפש את `message` ואז את `chat` ואת השדה `id`. זהו ה-Chat ID האישי שלך. השתמש בכתובת זו רק בדפדפן שלך ואל תשתף אותה, כי היא מכילה את הטוקן.

## 3. הפעלת Cloud Functions

אם פרויקט Firebase עדיין בתוכנית Spark, פתח את Firebase Console → Usage and billing ושדרג ל-Blaze באמצעות חשבון חיוב. תשלום בפועל תלוי בשימוש ובמכסות.

## 4. פרסום הפונקציה

בטרמינל של מחשב שבו מותקנים Node.js ו-Git:

```bash
npm install -g firebase-tools
git clone https://github.com/rovaitgadsam/ort-shakim-staff-screen.git
cd ort-shakim-staff-screen
firebase login
firebase use ort-shakim-staff
cd functions
npm install
cd ..
firebase functions:secrets:set TELEGRAM_BOT_TOKEN
```

כאשר תתבקש, הדבק את Bot Token בטרמינל. לאחר מכן הרץ:

```bash
firebase functions:secrets:set TELEGRAM_CHAT_ID
```

הדבק את Chat ID, ואז פרסם:

```bash
firebase deploy --only functions:notifyOnNewQrMessage
```

הפקודות שומרות את הסודות ב-Firebase ולא במאגר GitHub. אם Firebase מבקש לקשר חשבון חיוב, יש להשלים זאת במסוף Firebase לפני הפרסום.

## 5. בדיקה

פתח את טופס ה-QR באתר ושלח הודעת בדיקה. אמורה להגיע לטלגרם התראה עם שם השולח, תוכן ההודעה וקישור למסך הניהול. ההודעה עדיין תצטרך אישור במסך הניהול כרגיל.

אין צורך לשנות את כללי Firestore כדי שפונקציית ההתראות תפעל.
