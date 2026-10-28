import { onSnapshot } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { auth, db, siteDoc } from "./firebase.js";
import { ADMIN_UID } from "./firebase-config.js";
import { initAdmin } from "./admin.js";
import { renderBirthdays } from "./birthdays.js";
import { createWeatherLoader } from "./weather.js";

const areas=[
'תמר, קומה עליונה','תמר, קומת ביניים','תמר, קומת קרקע','דקל, קומה עליונה','חצר צפונית + מאחורי הקפיטריה','שחק, קומה עליונה','שחק, קומת קרקע','רחבת הדגל','בניין ורד, קומה עליונה','בניין ורד, קומת קרקע'
];

// The arrays follow the left-to-right column order of the supplied PDF.
const defaultRoster=[
{day:'ראשון',b2:['שלוש רימון','לופו תומר','אבוטבול אור','ביליה איציק','ינקוביץ זוהר שרון','דוידוביץ ליאת','פלד מירב','סופר נירית','ארהרד רן','דאר עדי'],b4:['פאולייקו לודמילה','לופו תומר','קוריאט אוריאן','ריינהרץ אורטל','יגיל ענת','שיין אלן','כהן ליעד','גרוסמן שחר','צוריאל ליאת','רוטנר דניאל']},
{day:'שני',b2:['כהן אמיר','שרביט יוסי','רייף בק אפרת','כהן ליעד','מרי חנאני','מאיזלס רותם','בן עזרא ערן','פוניאה גיל','גלשטיין מוטי','אלינה קסמן'],b4:['בכר גלי','דהן נסיה','ורדי גפן','דיין גולן','לוי שוש','יונני מירב','אלירן נחמה','בן יאיר דנה','אמנוני שי','וייס מני']},
{day:'שלישי',b2:['ירושלמי דקלה','אביאל זוהר','גפן נילי','ברקן רוית','סוויד דניאל','אוסיפוב אורה','דקל מוטי, בר קרן','צוריאל ליאת','ברנע דלית',''],b4:['דהן נסיה','סופר נירית','ביליה איציק','ריינהרץ אורטל','בר טל','מרלי נועם','שיינמן לבנת','חנניה מאיה','מקמל איריס','מאיזלס רותם']},
{day:'רביעי',b2:['ורדי גפן','אזולאי רעיה','שיינמן לבנת','ארהרד רן','לדנוב יאנה','יונני מירב','אלרגבלי דורון','שלוש רימון','בן טל איתי','נחמה אלירז'],b4:['ירושלמי דקלה','חנאני מרי','זוהר אביאל','דאר עדי','דוידוביץ ליאת','כהן אמיר ליעד','אוסיפוב אורה','פוניאה גיל','קושניר תמר','']},
{day:'חמישי',b2:['שיין אלן','אבוטבול אור','חנניה מאיה','בר טל','פאולייקו לודמילה','תמר','אלירז','איריס','איציק','וייס מני'],b4:['גרוסמן שחר','דיין גולן','בר לב אביב','ברנע דלית','קרן בר','סוויד דניאל','בן עזרא ערן','רייף בק אפרת','בוכריס יגאל','בן יאיר דנה']}
];
let state={roster:defaultRoster,notices:[{id:1,text:'ברוכים הבאים לחדר המורים אורט שחקים'}],city:'נהריה',ticker:''};
try{const saved=localStorage.getItem('shakimStaffScreen');if(saved){const parsed=JSON.parse(saved);state={...state,...parsed};if(!Array.isArray(state.roster?.[0]?.b2)){state.roster=defaultRoster}}}catch(e){}

const weekdays=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
function todayName(){return weekdays[new Date().getDay()]}
function punctuateHebrewNumber(s){return s.length===1?s+"׳":s.slice(0,-1)+"״"+s.slice(-1)}
function numberToHebrew(n){if(n===15)return 'ט״ו';if(n===16)return 'ט״ז';const letters={1:'א',2:'ב',3:'ג',4:'ד',5:'ה',6:'ו',7:'ז',8:'ח',9:'ט',10:'י',20:'כ',30:'ל'};if(letters[n])return punctuateHebrewNumber(letters[n]);let raw='';if(n>=20){raw='כ';n-=20}else if(n>=10){raw='י';n-=10}if(n===15)return 'ט״ו';if(n===16)return 'ט״ז';raw+=(letters[n]||'');return raw?punctuateHebrewNumber(raw):''}
function yearToHebrew(y){let n=y%1000;const vals=[[400,'ת'],[300,'ש'],[200,'ר'],[100,'ק'],[90,'צ'],[80,'פ'],[70,'ע'],[60,'ס'],[50,'נ'],[40,'מ'],[30,'ל'],[20,'כ'],[10,'י'],[9,'ט'],[8,'ח'],[7,'ז'],[6,'ו'],[5,'ה'],[4,'ד'],[3,'ג'],[2,'ב'],[1,'א']];let s='';for(const [v,l] of vals){while(n>=v){s+=l;n-=v}}return punctuateHebrewNumber(s)}
function hebrewDateText(date){const parts=new Intl.DateTimeFormat('en-u-ca-hebrew-nu-latn',{day:'numeric',month:'long',year:'numeric'}).formatToParts(date);const day=Number(parts.find(p=>p.type==='day')?.value);const month=parts.find(p=>p.type==='month')?.value||'';const year=Number(parts.find(p=>p.type==='year')?.value);const months={'Tishri':'תשרי','Heshvan':'חשוון','Marcheshvan':'חשוון','Kislev':'כסלו','Tevet':'טבת','Shevat':'שבט','Adar':'אדר','Adar I':'אדר א׳','Adar II':'אדר ב׳','Nisan':'ניסן','Iyyar':'אייר','Sivan':'סיוון','Tamuz':'תמוז','Av':'אב','Elul':'אלול'};return `${numberToHebrew(day)} ב${months[month]||month} ${yearToHebrew(year)}`}
function formatDates(){const now=new Date();document.getElementById('gregDate').textContent=new Intl.DateTimeFormat('he-IL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);try{document.getElementById('hebDate').textContent=hebrewDateText(now)}catch(e){document.getElementById('hebDate').textContent='תאריך עברי'}document.getElementById('todayLabel').textContent='יום '+todayName()}
function renderDuties(){const day=todayName();const item=state.roster.find(x=>x.day===day);const root=document.getElementById('dutyCards');if(!item){root.innerHTML='<div class="duty-card"><h3>אין תורנויות מתוכננות</h3><div class="names empty">יום ללא שיבוץ בלוח</div></div>';return}root.innerHTML=[{key:'b2',title:'הפסקה 2',time:'09:35–09:55',cls:''},{key:'b4',title:'הפסקה 4',time:'11:30–11:40',cls:'second'}].map(period=>`<section class="period-block ${period.cls}"><div class="period-heading"><h3>${period.title}</h3><span>${period.time}</span></div><div class="areas-grid">${areas.map((area,i)=>{const names=(item[period.key]||[])[i]||'';return `<article class="area-card"><h4>${escapeHtml(area)}</h4><div class="area-names ${names?'':'empty'}">${escapeHtml(names||'לא שובץ מורה')}</div></article>`}).join('')}</div></section>`).join('')}
function renderNotices(){const root=document.getElementById('announcements');root.innerHTML=state.notices.length?state.notices.map(n=>`<div class="notice">${escapeHtml(n.text)}</div>`).join(''):'<div class="notice">אין הודעות בלוח כרגע</div>';document.getElementById('updatedAt').textContent=state.ticker||'המסך מתעדכן אוטומטית'}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

const loadWeather = createWeatherLoader({ getCity: () => state.city, escapeHtml });
initAdmin({ auth, db, siteDoc, ADMIN_UID, state, areas, escapeHtml, renderDuties, renderNotices, loadWeather });

// Live-sync the public screen with the document that the admin updates on approval.
onSnapshot(siteDoc, snapshot => {
  if (!snapshot.exists()) return;
  const remote = snapshot.data() || {};
  if (Array.isArray(remote.roster) && remote.roster.length) state.roster = remote.roster;
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

