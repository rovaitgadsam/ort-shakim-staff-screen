const birthdays = [
  {name:"אור אבוטבול", month:4, day:19},
  {name:"חזי אדמוני", month:7, day:22},
  {name:"הדר אהרוני", month:11, day:30},
  {name:"צחי אוברמן", month:6, day:12},
  {name:"איציק אוחיון", month:3, day:12},
  {name:"אורה אוסיפוב", month:7, day:12},
  {name:"רעיה אזולאי", month:6, day:19},
  {name:"ולדי איטוביץ", month:1, day:25},
  {name:"רינת אירלנד", month:1, day:31},
  {name:"דורון אלגרבלי", month:7, day:21},
  {name:"שולי אליקן", month:12, day:2},
  {name:"טליה אמודאי", month:10, day:5},
  {name:"נורית אמיר בורר", month:12, day:22},
  {name:"שי אמנוני", month:10, day:11},
  {name:"שחף אסס", month:2, day:21},
  {name:"רן ארהרד", month:6, day:14},
  {name:"ערן אשל", month:9, day:22},
  {name:"יגאל בוכריס", month:6, day:14},
  {name:"ענבר ביטון", month:11, day:30},
  {name:"יצחק ביליה", month:11, day:16},
  {name:"גלי בכר", month:1, day:27},
  {name:"ליאת בן אור", month:8, day:24},
  {name:"איתי בן טל", month:4, day:18},
  {name:"דנה בן יאיר", month:4, day:23},
  {name:"ערן בן עזרא", month:12, day:28},
  {name:"ליאור בנסטי", month:4, day:7},
  {name:"דורית בר", month:5, day:8},
  {name:"טל בר", month:5, day:12},
  {name:"קרן בר", month:2, day:16},
  {name:"אביב בר לב", month:1, day:7},
  {name:"יואל ברדוגו", month:10, day:15},
  {name:"נירית ברוור", month:6, day:12},
  {name:"דלית ברנע", month:6, day:27},
  {name:"רווית ברקן", month:7, day:10},
  {name:"נארמין גדבאו", month:4, day:7},
  {name:"קלרה גודורוב", month:8, day:10},
  {name:"מוטי גלשטיין", month:10, day:14},
  {name:"נילי גפן", month:5, day:16},
  {name:"אלה גרבשטיין", month:9, day:6},
  {name:"שחר גרוסמן", month:12, day:23},
  {name:"נסיה דהן", month:7, day:10},
  {name:"ליאת דוידוביץ", month:11, day:3},
  {name:"גולן דיין", month:2, day:21},
  {name:"מוטי דקל", month:8, day:29},
  {name:"עדי דר", month:12, day:12},
  {name:"אלכס וולינסקי", month:5, day:2},
  {name:"מני וייס", month:9, day:15},
  {name:"עודד ולנסי", month:11, day:16},
  {name:"אלינה וקסמן", month:7, day:19},
  {name:"גפן ורדי", month:3, day:17},
  {name:"אביאל זוהר", month:5, day:31},
  {name:"שרון זוהר", month:7, day:20},
  {name:"כריסטיאן חמיסה", month:2, day:15},
  {name:"מרי חנאני", month:3, day:22},
  {name:"מאיה חנניה", month:5, day:24},
  {name:"ענת יגיל", month:11, day:19},
  {name:"מירב יונני", month:1, day:4},
  {name:"טיבי ייגר", month:7, day:5},
  {name:"דקלה ירושלמי", month:7, day:4},
  {name:"ליעד כהן", month:2, day:9},
  {name:"אמיר כהן", month:7, day:1},
  {name:"יאנה לדניוב", month:3, day:27},
  {name:"שוש לוי", month:2, day:18},
  {name:"תומר לופו", month:4, day:18},
  {name:"רוני מאור לילה", month:5, day:25},
  {name:"רותם מאיזליס", month:8, day:29},
  {name:"רוני מגריל", month:11, day:7},
  {name:"איריס מקמל", month:7, day:22},
  {name:"נעם מרלי", month:2, day:24},
  {name:"אלירן נחמה", month:7, day:22},
  {name:"דניאל סוויד", month:12, day:20},
  {name:"צחי סולומוביץ", month:3, day:1},
  {name:"נירית סופר", month:4, day:10},
  {name:"מור סורצ'קין", month:5, day:7},
  {name:"לודמילה פאלוייקו", month:10, day:21},
  {name:"גיל פוניאה", month:3, day:26},
  {name:"מירב פלד", month:5, day:15},
  {name:"אלירז פלק", month:10, day:25},
  {name:"יובל פרץ", month:12, day:29},
  {name:"ליאת צוריאל", month:6, day:28},
  {name:"אולגה קובלנקו", month:5, day:11},
  {name:"אודיה קוניג", month:5, day:2},
  {name:"אוריין קוריאט", month:4, day:27},
  {name:"תמר קושניר", month:3, day:26},
  {name:"ענת קליין", month:9, day:14},
  {name:"דניאל רוטנר", month:3, day:13},
  {name:"אורטל ריינהרץ", month:5, day:26},
  {name:"אפרת רייף בק", month:11, day:15},
  {name:"ליבנת שיימן", month:5, day:11},
  {name:"אלן שיין", month:11, day:18},
  {name:"רימון שלוש", month:3, day:22},
  {name:"יוסף שרביט", month:8, day:19}
,
  {name:"ציון אברהם", month:6, day:12},
  {name:"אילנה אדלר", month:5, day:7},
  {name:"אבינועם אוחנה", month:1, day:24},
  {name:"מירב איתן", month:2, day:11},
  {name:"קסניה אלברדיאן", month:1, day:7},
  {name:"יפעת אלל-רחום", month:7, day:3},
  {name:"אורית אלקובי", month:10, day:25},
  {name:"רויטל אנגר", month:11, day:15},
  {name:"עמי אסף", month:2, day:13},
  {name:"אלינה ארמר", month:10, day:22},
  {name:"רעיה בן חמו", month:1, day:2},
  {name:"דניאלה דה פז", month:11, day:21},
  {name:"אילנית דהן", month:5, day:24},
  {name:"עינת לביב", month:12, day:9},
  {name:"ויטה לחצר", month:3, day:27},
  {name:"ליאן מימון", month:2, day:2},
  {name:"לנה מרקוב", month:1, day:1},
  {name:"עדי נפתליאב", month:1, day:31},
  {name:"דוד ספיאשוילי", month:3, day:23},
  {name:"רים עלי", month:11, day:11},
  {name:"חגית עמיר", month:5, day:15},
  {name:"קרן פרץ", month:9, day:1},
  {name:"ג'נט קורט", month:10, day:16},
  {name:"דלית רחימי", month:9, day:6},
  {name:"רחל רם", month:5, day:12},
  {name:"דליה שאול", month:2, day:17},
  {name:"אדית מיקנר", month:9, day:11}
];


// Staff names are displayed with given name first and family name last.
function normalizedName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}
function nameTokenKey(value) {
  return normalizedName(value).split(" ").filter(Boolean).sort().join(" ");
}
const canonicalNamesByTokens = new Map();
for (const person of birthdays) {
  const key = nameTokenKey(person.name);
  if (canonicalNamesByTokens.has(key) && canonicalNamesByTokens.get(key) !== person.name) {
    canonicalNamesByTokens.set(key, null);
  } else {
    canonicalNamesByTokens.set(key, person.name);
  }
}
const explicitNameOrder = new Map([
  ["ביליה איציק", "איציק ביליה"],
  ["ינקוביץ זוהר שרון", "זוהר שרון ינקוביץ"],
  ["דאר עדי", "עדי דאר"],
  ["פאולייקו לודמילה", "לודמילה פאולייקו"],
  ["קוריאט אוריאן", "אוריאן קוריאט"],
  ["שרביט יוסי", "יוסי שרביט"],
  ["מאיזלס רותם", "רותם מאיזלס"],
  ["אלינה קסמן", "אלינה קסמן"],
  ["ברקן רוית", "רוית ברקן"],
  ["מרלי נועם", "נועם מרלי"],
  ["שיינמן לבנת", "לבנת שיינמן"],
  ["לדנוב יאנה", "יאנה לדנוב"],
  ["אלרגבלי דורון", "דורון אלרגבלי"],
  ["נחמה אלירז", "אלירז נחמה"],
  ["כהן אמיר ליעד", "אמיר כהן, ליעד כהן"],
  ["תמר", "תמר קושניר"],
  ["אלירז", "אלירז נחמה"],
  ["איריס", "איריס מקמל"],
  ["איציק", "איציק ביליה"]
].map(([from, to]) => [normalizedName(from), to]));

function formatOneStaffName(value) {
  const name = normalizedName(value);
  if (!name) return "";
  const explicit = explicitNameOrder.get(name);
  if (explicit) return explicit;
  const canonical = canonicalNamesByTokens.get(nameTokenKey(name));
  return canonical || name;
}

export function formatStaffName(value) {
  const full = normalizedName(value);
  if (!full) return "";
  return full.split(/\s*,\s*/).map(formatOneStaffName).join(", ");
}

function israelMonthAndDay(){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jerusalem',month:'numeric',day:'numeric'}).formatToParts(new Date());
  return {month:Number(parts.find(part=>part.type==='month').value),day:Number(parts.find(part=>part.type==='day').value)};
}
export function renderBirthdays(escapeHtml){
  const root=document.getElementById('birthdaysContent');
  if(!root)return;
  const today=israelMonthAndDay();
  const names=birthdays.filter(person=>person.month===today.month&&person.day===today.day).map(person=>person.name);
  if(names.length){
    root.innerHTML='<div class="birthday-confetti">🎈 🎉 🎂</div><div class="birthday-greeting">מזל טוב ליום ההולדת!</div><p class="birthday-subtitle">מאחלים לכם יום מלא בשמחה, בריאות והצלחות.</p><div class="birthday-names">'+names.map(name=>'<span class="birthday-name">'+escapeHtml(name)+'</span>').join('')+'</div>';
  }else{
    root.innerHTML='<div class="birthday-confetti">🎈 🎉 🎂</div><div class="birthday-empty">היום אין ימי הולדת בסגל</div><p class="birthday-subtitle">מאחלים לכולם יום שמח ומלא סיבות לחגוג!</p>';
  }
}
