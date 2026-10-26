# חדר המורים אורט שחקים

אתר סטטי להצגת תורנויות לפי מתחם, הודעות חשובות, תאריך עברי ולועזי ומזג אוויר. התוכן נטען מ-Firebase Firestore ומסתנכרן בזמן אמת.

## פרסום באמצעות GitHub Pages

1. ב-GitHub, היכנסו ל-**Settings → Pages**.
2. תחת **Build and deployment**, בחרו `Deploy from a branch`.
3. בחרו בענף `main` ובתיקייה `/ (root)), ואז לחצו **Save**.
4. כתובת האתר תופיע באותו מסך לאחר הפרסום.

## הגדרת Firebase, חד-פעמית

### 1. הפעלת Authentication

1. פתחו את [Firebase Console](https://console.firebase.google.com/) ובחרו בפרויקט `ort-shakim-staff`.
2. פתחו **Authentication → Sign-in method**.
3. הפעילו את הספק **Email/Password**.
4. תחת **Authentication → Users**, ודאו שקיים משתמש המנהל עם UID:
   `vNazaWZ5jKaZItnrlM0hRPGT2hd2`.
   אם ה-UID אינו תואם בדיוק, עדכנו את `ADMIN_UID` ב-`index.html` וגם את ה-UID בקובץ `firestore.rules`.
5. ב-**Authentication → Settings → Authorized domains**, ודאו שדומיין האתר מופיע. עבור GitHub Pages, הוסיפו את `rovaitgadsam.github.io` אם הוא חסר.

### 2. יצירת Firestore

1. ב-Firebase Console פתחו **Firestore Database** וצרו Cloud Firestore במצב Production.
2. בחרו מיקום למסד הנתונים. מיקום באירופה הוא בחירה סבירה לקהל בישראל, אך מיקום שכבר הוקצה בדרך כלל לא ניתן לשינוי.
3. פתחו את לשונית **Rules** ב-Firestore.
4. העתיקו את תוכן הקובץ `firestore.rules` מהמאגר, הדביקו אותו בעורך הכללים ולחצו **Publish**.

הכללים מאפשרים קריאה ציבורית למסמך יחיד בשם `siteData/main`, כדי שהטלוויזיה תוכל להציג מידע ללא כניסה. כתיבה מותרת רק למשתמש Firebase Authentication שמזהה המשתמש שלו תואם ל-UID המוגדר בכללים.

### 3. יצירת המסמך הראשוני

1. פתחו את כתובת האתר.
2. לחצו **מסך ניהול**.
3. התחברו עם כתובת הדוא"ל והסיסמה של משתמש המנהל שכבר נוצר ב-Firebase Authentication.
4. לחצו **שמירת שינויים בענן** פעם אחת, כדי ליצור את המסמך הראשון `siteData/main`.

לא צריך להכניס סיסמה לקוד או למאגר GitHub. קובץ `firebaseConfig` מכיל מזהי אפליקציה ציבוריים, וההרשאות נאכפות באמצעות Authentication וכללי Firestore.

## שימוש ופתרון תקלות

- עריכות שנשמרות בענן מסתנכרנות בזמן אמת לכל דפדפן פתוח שמציג את האתר.
- משתמשים שלא הוגדרו כמנהל אינם יכולים לשנות תוכן.
- אם הכניסה נכשלת עם `auth/operation-not-allowed`, הפעילו Email/Password.
- אם הכניסה נכשלת עם `auth/unauthorized-domain`, הוסיפו את דומיין האתר ל-Authorized domains.
- אם שמירה נכשלת עם `permission-denied`, פרסמו את כללי `firestore.rules` ובדקו שמזהה המנהל תואם.
- אם Firestore לא זמין, ודאו שנוצר מסד Cloud Firestore בפרויקט הנכון ושהמסמך הראשוני נוצר באמצעות מסך הניהול.

## הערת פרטיות

המידע במסמך `siteData/main` נקרא ללא התחברות, משום שהוא מיועד לתצוגה ציבורית באתר. אין לשמור בו מידע אישי רגיש. פרטי הניהול מוגנים על ידי Firebase Authentication וכללי Firestore.


## הודעות דרך קוד QR

האתר כולל את `submit.html`, טופס ציבורי לשליחת הודעה לאישור מנהל. כדי להפעיל אותו:

1. ב-Firebase Console פתחו **Authentication → Sign-in method** והפעילו את **Anonymous** בנוסף ל-Email/Password.
2. ב-Firestore פתחו **Rules**, העתיקו את כל תוכן `firestore.rules` מהמאגר ולחצו **Publish**.
3. ודאו שדומיין GitHub Pages מופיע ב-**Authentication → Settings → Authorized domains**.
4. סרקו את קוד ה-QR במסך. הודעות שהוגשו יופיעו במסך הניהול תחת **הודעות שהתקבלו מה-QR**. רק לאחר לחיצה על **אישור והצגה בלוח** הן יתווספו להודעות הציבוריות.

כללי Firestore מאפשרים למבקרים אנונימיים רק ליצור הודעה קצרה ומוגבלת, ואינם מאפשרים להם לקרוא, לשנות או למחוק את תיבת ההודעות. רק משתמש המנהל המוגדר יכול לקרוא ולמחוק את ההודעות הממתינות.
