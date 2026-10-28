import { onSnapshot, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { auth, db, siteDoc } from "./firebase.js";
import { ADMIN_UID } from "./firebase-config.js";
import { initAdmin } from "./admin.js";
import { renderBirthdays, formatStaffName } from "./birthdays.js";
import { createWeatherLoader } from "./weather.js";

const areas=[
'תמר, קומה עליונה','תמר, קומת ביניים','תמר, קומת קרקע','דקל, קומה עליונה','חצר צפונית + מאחורי הקפיטריה','שחק, קומה עליונה','שחק, קומת קרקע','רחבת הדגל','בניין ורד, קומה עליונה','בניין ורד, קומת קרקע'
];

// The arrays follow the left-to-right column order of the supplied PDF.
const defaultRoster=[
{day:'ראשון',b2:['רימון שלוש','תומר לופו','אור אבוטבול','איציק ביליה','זוהר שרון ינקוביץ','ליאת דוידוביץ','מירב פלד','נירית סופר','רן ארהרד','עדי דאר'],b4:['לודמילה פאולייקו','תומר לופו','אוריאן קוריאט','אורטל ריינהרץ','ענת יגיל','אלן שיין','ליעד כהן','שחר גרוסמן','ליאת צוריאל','דניאל רוטנר']},
{day:'שני',b2:['אמיר כהן','יוסי שרביט','אפרת רייף בק','ליעד כהן','מרי חנאני','רותם מאיזלס','ערן בן עזרא','גיל פוניאה','מוטי גלשטיין','אלינה וקסמן'],b4:['גלי בכר','נסיה דהן','גפן ורדי','גולן דיין','שוש לוי','מירב יונני','אלירן נחמה','דנה בן יאיר','שי אמנוני','מני וייס']},
{day:'שלישי',b2:['דקלה ירושלמי','זוהר אביאל','נילי גפן','רוית ברקן','דניאל סוויד','אורה אוסיפוב','קרן בר','מוטי דקל','ליאת צוריאל','דלית ברנע'],b4:['נסיה דהן','נירית סופר','איציק ביליה','אורטל ריינהרץ','טל בר','נועם מרלי','לבנת שיינמן','מאיה חנניה','איריס מקמל','רותם מאיזלס']},
{day:'רביעי',b2:['גפן ורדי','רעיה אזולאי','לבנת שיינמן','רן ארהרד','יאנה לדנוב','מירב יונני','דורון אלגרבלי','רימון שלוש','איתי בן טל','אלירז נחמה'],b4:['דקלה ירושלמי','מרי חנאני','אביאל זוהר','עדי דאר','ליאת דוידוביץ','ליעד כהן','אמיר כהן','אורה אוסיפוב','גיל פוניאה','תמר קושניר']},
{day:'חמישי',b2:['אלן שיין','אור אבוטבול','מאיה חנניה','טל בר','לודמילה פאולייקו','תמר קושניר','אלירז פלק','איריס מקמל','איציק אוחיון','מני וייס'],b4:['שחר גרוסמן','גולן דיין','אביב בר לב','דלית ברנע','קרן בר','דניאל סוויד','ערן בן עזרא','אפרת רייף בק','יגאל בוכריס','דנה בן יאיר']}
];

/*
 * Migrate known errors from the previously imported duty table.
 * Narrow checks preserve unrelated manual edits in other cells.
 */
function normalizeRosterCell(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}
function cellHas(value, ...tokens) {
  const text = normalizeRosterCell(value);
  return tokens.every(token => text.includes(token));
}
function correctKnownRosterAssignments(sourceRoster) {
  const roster = (Array.isArray(sourceRoster) ? sourceRoster : defaultRoster).map(row => ({
    ...row,
    b2: Array.isArray(row.b2) ? [...row.b2] : [],
    b4: Array.isArray(row.b4) ? [...row.b4] : []
  }));
  let changed = false;
  const setCell = (row, key, index, value) => {
    if (row[key][index] !== value) {
      row[key][index] = value;
      changed = true;
    }
  };
  const findDay = day => roster.find(row => row.day === day);

  // Tuesday break 2: two names were merged in one area, shifting the final areas.
  const tuesday = findDay("שלישי");
  if (tuesday && cellHas(tuesday.b2[6], "דקל", "מוטי", "בר", "קרן")
      && cellHas(tuesday.b2[7], "צוריאל")
      && cellHas(tuesday.b2[8], "ברנע")
      && !normalizeRosterCell(tuesday.b2[9])) {
    setCell(tuesday, "b2", 6, "קרן בר");
    setCell(tuesday, "b2", 7, "מוטי דקל");
    setCell(tuesday, "b2", 8, "ליאת צוריאל");
    setCell(tuesday, "b2", 9, "דלית ברנע");
  }

  // Wednesday break 4: Amir Cohen and Liad Cohen were merged into one area.
  const wednesday = findDay("רביעי");
  if (wednesday && cellHas(wednesday.b4[5], "כהן", "אמיר", "ליעד")
      && cellHas(wednesday.b4[6], "אוסיפוב")
      && cellHas(wednesday.b4[7], "פוניאה")
      && cellHas(wednesday.b4[8], "קושניר")
      && !normalizeRosterCell(wednesday.b4[9])) {
    setCell(wednesday, "b4", 5, "ליעד כהן");
    setCell(wednesday, "b4", 6, "אמיר כהן");
    setCell(wednesday, "b4", 7, "אורה אוסיפוב");
    setCell(wednesday, "b4", 8, "גיל פוניאה");
    setCell(wednesday, "b4", 9, "תמר קושניר");
  }

  // Thursday break 2: four cells had given names only, and one family name was wrong.
  const thursday = findDay("חמישי");
  if (thursday && cellHas(thursday.b2[5], "תמר")
      && cellHas(thursday.b2[6], "אלירז")
      && cellHas(thursday.b2[7], "איריס")
      && cellHas(thursday.b2[8], "איציק")
      && cellHas(thursday.b2[9], "וייס")) {
    setCell(thursday, "b2", 5, "תמר קושניר");
    setCell(thursday, "b2", 6, "אלירז פלק");
    setCell(thursday, "b2", 7, "איריס מקמל");
    setCell(thursday, "b2", 8, "איציק אוחיון");
    setCell(thursday, "b2", 9, "מני וייס");
  }

  const monday = findDay("שני");
  if (monday && normalizeRosterCell(monday.b2[9]) === "אלינה קסמן") {
    setCell(monday, "b2", 9, "אלינה וקסמן");
  }

  if (wednesday && cellHas(wednesday.b2[6], "דורון")
      && (cellHas(wednesday.b2[6], "אלרגבלי") || cellHas(wednesday.b2[6], "אלגרבלי"))) {
    setCell(wednesday, "b2", 6, "דורון אלגרבלי");
  }

  return { roster, changed };
}

let pendingRosterMigration = null;
let rosterMigrationInFlight = false;
async function persistRosterMigrationIfAdmin() {
  const user = auth.currentUser;
  if (!pendingRosterMigration || rosterMigrationInFlight || !user || user.uid !== ADMIN_UID) return;
  const rosterToSave = pendingRosterMigration;
  rosterMigrationInFlight = true;
  try {
    await updateDoc(siteDoc, {
      roster: rosterToSave,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid
    });
    if (pendingRosterMigration === rosterToSave) pendingRosterMigration = null;
  } catch (error) {
    console.warn("Roster correction could not be saved to Firestore; corrected display remains active.", error);
  } finally {
    rosterMigrationInFlight = false;
  }
}

let state={roster:defaultRoster,notices:[{id:1,text:'ברוכים הבאים לחדר המורים אורט שחקים'}],city:'נהריה',ticker:''};
try{const saved=localStorage.getItem('shakimStaffScreen');if(saved){const parsed=JSON.parse(saved);state={...state,...parsed};if(!Array.isArray(state.roster?.[0]?.b2)){state.roster=defaultRoster}}}catch(e){}
state.roster = correctKnownRosterAssignments(state.roster).roster;

const weekdays=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
function todayName(){return weekdays[new Date().getDay()]}
function punctuateHebrewNumber(s){return s.length===1?s+"׳":s.slice(0,-1)+"״"+s.slice(-1)}
function numberToHebrew(n){if(n===15)return 'ט״ו';if(n===16)return 'ט״ז';const letters={1:'א',2:'ב',3:'ג',4:'ד',5:'ה',6:'ו',7:'ז',8:'ח',9:'ט',10:'י',20:'כ',30:'ל'};if(letters[n])return punctuateHebrewNumber(letters[n]);let raw='';if(n>=20){raw='כ';n-=20}else if(n>=10){raw='י';n-=10}if(n===15)return 'ט״ו';if(n===16)return 'ט״ז';raw+=(letters[n]||'');return raw?punctuateHebrewNumber(raw):''}
function yearToHebrew(y){let n=y%1000;const vals=[[400,'ת'],[300,'ש'],[200,'ר'],[100,'ק'],[90,'צ'],[80,'פ'],[70,'ע'],[60,'ס'],[50,'נ'],[40,'מ'],[30,'ל'],[20,'כ'],[10,'י'],[9,'ט'],[8,'ח'],[7,'ז'],[6,'ו'],[5,'ה'],[4,'ד'],[3,'ג'],[2,'ב'],[1,'א']];let s='';for(const [v,l] of vals){while(n>=v){s+=l;n-=v}}return punctuateHebrewNumber(s)}
function hebrewDateText(date){const parts=new Intl.DateTimeFormat('en-u-ca-hebrew-nu-latn',{day:'numeric',month:'long',year:'numeric'}).formatToParts(date);const day=Number(parts.find(p=>p.type==='day')?.value);const month=parts.find(p=>p.type==='month')?.value||'';const year=Number(parts.find(p=>p.type==='year')?.value);const months={'Tishri':'תשרי','Heshvan':'חשוון','Marcheshvan':'חשוון','Kislev':'כסלו','Tevet':'טבת','Shevat':'שבט','Adar':'אדר','Adar I':'אדר א׳','Adar II':'אדר ב׳','Nisan':'ניסן','Iyyar':'אייר','Sivan':'סיוון','Tamuz':'תמוז','Av':'אב','Elul':'אלול'};return `${numberToHebrew(day)} ב${months[month]||month} ${yearToHebrew(year)}`}
function formatDates(){const now=new Date();document.getElementById('gregDate').textContent=new Intl.DateTimeFormat('he-IL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);try{document.getElementById('hebDate').textContent=hebrewDateText(now)}catch(e){document.getElementById('hebDate').textContent='תאריך עברי'}document.getElementById('todayLabel').textContent='יום '+todayName()}
function renderDuties(){const day=todayName();const item=state.roster.find(x=>x.day===day);const root=document.getElementById('dutyCards');if(!item){root.innerHTML='<div class="duty-card"><h3>אין תורנויות מתוכננות</h3><div class="names empty">יום ללא שיבוץ בלוח</div></div>';return}root.innerHTML=[{key:'b2',title:'הפסקה 2',time:'09:35–09:55',cls:''},{key:'b4',title:'הפסקה 4',time:'11:30–11:40',cls:'second'}].map(period=>`<section class="period-block ${period.cls}"><div class="period-heading"><h3>${period.title}</h3><span>${period.time}</span></div><div class="areas-grid">${areas.map((area,i)=>{const names=(item[period.key]||[])[i]||'';return `<article class="area-card"><h4>${escapeHtml(area)}</h4><div class="area-names ${names?'':'empty'}">${escapeHtml(formatStaffName(names||'לא שובץ מורה'))}</div></article>`}).join('')}</div></section>`).join('')}
function renderNotices(){const root=document.getElementById('announcements');root.innerHTML=state.notices.length?state.notices.map(n=>`<div class="notice">${escapeHtml(formatNoticeText(n.text))}</div>`).join(''):'<div class="notice">אין הודעות בלוח כרגע</div>';document.getElementById('updatedAt').textContent=state.ticker||'המסך מתעדכן אוטומטית'}
function formatNoticeText(value){
  const text=String(value??"");
  const match=text.match(/^([^:\n]{2,60}:)(\s*)/);
  if(!match)return text;
  return formatStaffName(match[1].slice(0,-1))+":"+match[2]+text.slice(match[0].length);
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

const loadWeather = createWeatherLoader({ getCity: () => state.city, escapeHtml });
initAdmin({ auth, db, siteDoc, ADMIN_UID, state, areas, escapeHtml, renderDuties, renderNotices, loadWeather });

// Live-sync the public screen with the document that the admin updates on approval.
onSnapshot(siteDoc, snapshot => {
  if (!snapshot.exists()) return;
  const remote = snapshot.data() || {};
  if (Array.isArray(remote.roster) && remote.roster.length) {
    const correction = correctKnownRosterAssignments(remote.roster);
    state.roster = correction.roster;
    if (correction.changed) {
      pendingRosterMigration = correction.roster;
      persistRosterMigrationIfAdmin();
    }
  }
  if (Array.isArray(remote.notices)) state.notices = remote.notices;
  if (typeof remote.city === "string" && remote.city.trim()) state.city = remote.city;
  if (typeof remote.ticker === "string") state.ticker = remote.ticker;
  try { localStorage.setItem("shakimStaffScreen", JSON.stringify(state)); } catch (e) {}
  renderDuties();
  renderNotices();
  loadWeather();
}, error => {
  console.error("Main dashboard Firestore listener failed", error);
});

onAuthStateChanged(auth, user => {
  if (user && user.uid === ADMIN_UID) persistRosterMigrationIfAdmin();
});

formatDates();
renderDuties();
renderNotices();
renderBirthdays(escapeHtml);
loadWeather();
setInterval(() => { formatDates(); renderDuties(); }, 60000);
setInterval(loadWeather, 30 * 60 * 1000);
 
// Toggle browser fullscreen directly from a user click.
const fullscreenBtn = document.getElementById("fullscreenBtn");
function syncFullscreenButton() {
  if (!fullscreenBtn) return;
  const active = Boolean(document.fullscreenElement);
  fullscreenBtn.textContent = active ? "⤢ יציאה ממסך מלא" : "⛶ הצג במסך מלא";
  fullscreenBtn.setAttribute("aria-pressed", String(active));
  fullscreenBtn.title = active ? "יציאה ממסך מלא" : "הצגת האתר במסך מלא";
}
if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        throw new Error("Fullscreen API is not supported by this browser");
      }
    } catch (error) {
      console.error("Fullscreen toggle failed", error);
      fullscreenBtn.textContent = "לא ניתן להציג במסך מלא";
      fullscreenBtn.title = "אפשר לנסות דרך תפריט הדפדפן";
      window.setTimeout(syncFullscreenButton, 2500);
    }
  });
  document.addEventListener("fullscreenchange", syncFullscreenButton);
  syncFullscreenButton();
}

