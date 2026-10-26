import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { collection, query, orderBy, onSnapshot, deleteDoc, updateDoc, arrayUnion, serverTimestamp, doc, setDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

export function initAdmin({ auth, db, siteDoc, ADMIN_UID, state, areas, escapeHtml, renderDuties, renderNotices, loadWeather }) {
let authUser = null;
let cloudHasData = false;

function isAdmin() {
  return Boolean(authUser && authUser.uid === ADMIN_UID);
}
let pendingMessageItems = [];
let unsubscribeMessageSubmissions = null;
let messageActionBusy = false;

function startPendingMessageListener() {
  if (!isAdmin() || unsubscribeMessageSubmissions) return;
  const submissionsQuery = query(collection(db, "messageSubmissions"), orderBy("createdAt", "desc"));
  unsubscribeMessageSubmissions = onSnapshot(submissionsQuery, snapshot => {
    pendingMessageItems = snapshot.docs.map(item => ({ docId: item.id, ...item.data() }));
    renderPendingMessages();
  }, error => {
    console.error("Pending message listener failed", error);
    const root = document.getElementById("pendingMessages");
    if (root) root.innerHTML = '<div class="hint">לא ניתן לטעון הודעות. בדוק שכללי Firestore עודכנו.</div>';
  });
}

function stopPendingMessageListener() {
  if (unsubscribeMessageSubmissions) unsubscribeMessageSubmissions();
  unsubscribeMessageSubmissions = null;
  pendingMessageItems = [];
  const root = document.getElementById("pendingMessages");
  if (root) root.innerHTML = '<div class="hint">התחבר כדי לראות הודעות ממתינות.</div>';
}

function renderPendingMessages() {
  const root = document.getElementById("pendingMessages");
  if (!root) return;
  if (!isAdmin()) {
    root.innerHTML = '<div class="hint">התחבר כדי לראות הודעות ממתינות.</div>';
    return;
  }
  if (!pendingMessageItems.length) {
    root.innerHTML = '<div class="hint">אין כרגע הודעות שממתינות לאישור.</div>';
    return;
  }
  root.innerHTML = pendingMessageItems.map(item => {
    const sender = typeof item.senderName === "string" && item.senderName.trim() ? item.senderName.trim() : "ללא שם";
    const timestamp = item.createdAt && typeof item.createdAt.toDate === "function"
      ? item.createdAt.toDate().toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })
      : "התקבלה כעת";
    return '<article class="pending-message">' +
      '<div class="pending-meta">' + escapeHtml(sender) + ' · ' + escapeHtml(timestamp) + '</div>' +
      '<p>' + escapeHtml(item.text || "") + '</p>' +
      '<div class="pending-actions"><button class="btn primary" data-approve-message="' + escapeHtml(item.docId) + '">אישור והצגה בלוח</button>' +
      '<button class="btn danger" data-delete-message="' + escapeHtml(item.docId) + '">דחייה</button></div></article>';
  }).join("");
}

async function handleMessageAction(action, submissionId) {
  if (!isAdmin() || messageActionBusy) return;
  const submission = pendingMessageItems.find(item => item.docId === submissionId);
  if (!submission) return;
  messageActionBusy = true;
  try {
    if (action === "approve") {
      const text = String(submission.text || "").trim();
      const sender = String(submission.senderName || "").trim();
      if (!text) throw new Error("ההודעה ריקה");
      const displayText = sender ? sender + ": " + text : text;
      await updateDoc(siteDoc, {
        notices: arrayUnion({ id: "qr-" + submissionId, text: displayText }),
        updatedAt: serverTimestamp(),
        updatedBy: authUser.uid
      });
    }
    await deleteDoc(doc(db, "messageSubmissions", submissionId));
    setCloudStatus(action === "approve" ? "ההודעה אושרה והוצגה בלוח." : "ההודעה נדחתה ונמחקה.");
  } catch (error) {
    console.error("Message moderation failed", error);
    setCloudStatus("לא ניתן לעדכן את ההודעה. בדוק את כללי Firestore וחזור לנסות.");
  } finally {
    messageActionBusy = false;
  }
}

function setCloudStatus(message) {
  const node = document.getElementById("cloudStatus");
  if (node) node.textContent = message;
}
function showLoginError(message) {
  const node = document.getElementById("loginError");
  if (node) node.textContent = message;
}

const areas=[
'תמר, קומה עליונה','תמר, קומת ביניים','תמר, קומת קרקע','דקל, קומה עליונה','חצר צפונית + מאחורי הקפיטריה','שחק, קומה עליונה','שחק, קומת קרקע','רחבת הדגל','בניין ורד, קומה עליונה','בניין ורד, קומת קרקע'
];


function renderEditors(){document.getElementById('rosterEditor').innerHTML=state.roster.map((r,i)=>`<div class="roster-row"><h4>${r.day}</h4>${[{key:'b2',title:'הפסקה 2, 09:35–09:55'},{key:'b4',title:'הפסקה 4, 11:30–11:40'}].map(period=>`<div style="margin-top:12px"><strong>${period.title}</strong><div class="roster-zone-grid" style="margin-top:8px">${areas.map((area,j)=>`<div class="zone-field"><label>${escapeHtml(area)}</label><input data-roster="${i}" data-period="${period.key}" data-area="${j}" value="${escapeHtml((r[period.key]||[])[j]||'')}" /></div>`).join('')}</div></div>`).join('')}</div>`).join('');
document.getElementById('noticeEditor').innerHTML=state.notices.map((n,i)=>`<div class="roster-row"><div class="field"><label>הודעה ${i+1}</label><textarea data-notice="${i}">${escapeHtml(n.text)}</textarea></div><button class="btn danger" data-delete="${i}">מחיקת הודעה</button></div>`).join('');document.getElementById('city').value=state.city||'נהריה';document.getElementById('ticker').value=state.ticker||''}
async function saveFromEditor(){
  if (!isAdmin()) {
    setCloudStatus("נדרשת כניסת מנהל כדי לשמור שינויים.");
    return;
  }
  document.querySelectorAll('[data-roster]').forEach(el=>{
    const row=state.roster[+el.dataset.roster];
    if(!Array.isArray(row[el.dataset.period])) row[el.dataset.period]=Array(areas.length).fill('');
    row[el.dataset.period][+el.dataset.area]=el.value.trim();
  });
  document.querySelectorAll('[data-notice]').forEach(el=>{state.notices[+el.dataset.notice].text=el.value});
  state.city=document.getElementById('city').value.trim()||'נהריה';
  state.ticker=document.getElementById('ticker').value.trim();
  try { localStorage.setItem('shakimStaffScreen',JSON.stringify(state)); } catch(e) {}
  setCloudStatus("שומר שינויים ב-Firebase…");
  document.getElementById('saveStatus').textContent="השמירה מתבצעת…";
  try {
    await setDoc(siteDoc, {
      roster: state.roster,
      notices: state.notices,
      city: state.city,
      ticker: state.ticker,
      updatedAt: serverTimestamp(),
      updatedBy: authUser.uid
    });
    cloudHasData = true;
    document.getElementById('saveStatus').textContent="השינויים נשמרו בענן.";
    setCloudStatus("מחובר ל-Firestore. השינויים מסתנכרנים בזמן אמת לכל המכשירים.");
  } catch (error) {
    console.error("Firestore save failed", error);
    const message = error?.code === "permission-denied"
      ? "אין הרשאת כתיבה. בדוק שפרסמת את firestore.rules וש-UID המנהל תואם."
      : "השמירה נכשלה: " + (error?.message || error);
    document.getElementById('saveStatus').textContent=message;
    setCloudStatus(message);
  }
  renderDuties(); renderNotices(); loadWeather();
}

document.getElementById('openAdmin').onclick=()=>{
  document.getElementById('admin').classList.add('open');
  if (isAdmin()) {
    document.getElementById('loginPanel').style.display='none';
    renderEditors();
  } else {
    document.getElementById('loginPanel').style.display='flex';
    showLoginError("");
  }
};
document.getElementById('loginClose').onclick=()=>{
  document.getElementById('loginPanel').style.display='none';
  document.getElementById('admin').classList.remove('open');
};
document.getElementById('loginBtn').onclick=async()=>{
  const email=document.getElementById('loginEmail').value.trim();
  const password=document.getElementById('loginPassword').value;
  showLoginError("");
  if(!email || !password){showLoginError("הזן כתובת דוא״ל וסיסמה.");return;}
  const btn=document.getElementById('loginBtn');
  btn.disabled=true;btn.textContent="מתחבר…";
  try{
    const credential=await signInWithEmailAndPassword(auth,email,password);
    if(credential.user.uid!==ADMIN_UID){
      await signOut(auth);
      showLoginError("לחשבון הזה אין הרשאת ניהול באתר.");
      return;
    }
    authUser=credential.user;
    document.getElementById('loginPanel').style.display='none';
    renderEditors();
    startPendingMessageListener();
    setCloudStatus("מחובר כמנהל. הנתונים מסתנכרנים בזמן אמת.");
  }catch(error){
    console.error("Firebase sign-in failed",error);
    const messages={
      "auth/invalid-credential":"הדוא״ל או הסיסמה שגויים.",
      "auth/invalid-email":"כתובת הדוא״ל אינה תקינה.",
      "auth/too-many-requests":"נחסמו זמנית ניסיונות כניסה. נסה שוב מאוחר יותר.",
      "auth/operation-not-allowed":"יש להפעיל Email/Password ב-Firebase Authentication."
    };
    showLoginError(messages[error?.code]||"הכניסה נכשלה: "+(error?.message||error));
  }finally{btn.disabled=false;btn.textContent="כניסה למסך הניהול";}
};
document.getElementById('logoutBtn').onclick=async()=>{
  await signOut(auth);
  authUser=null;
  document.getElementById('admin').classList.remove('open');
  document.getElementById('loginPanel').style.display='none';
};
document.getElementById('backView').onclick=()=>{
  document.getElementById('admin').classList.remove('open');
  document.getElementById('loginPanel').style.display='none';
};
document.getElementById('saveAll').onclick=saveFromEditor;
document.getElementById('addNotice').onclick=()=>{if(!isAdmin())return;const text=document.getElementById('noticeText').value.trim();if(!text)return;state.notices.push({id:Date.now(),text});document.getElementById('noticeText').value='';renderEditors()};
document.getElementById('admin').addEventListener('click',e=>{
  const approveButton=e.target.closest('[data-approve-message]');
  const rejectButton=e.target.closest('[data-delete-message]');
  if(approveButton){handleMessageAction("approve",approveButton.dataset.approveMessage);return;}
  if(rejectButton){handleMessageAction("reject",rejectButton.dataset.deleteMessage);return;}
  const noticeDelete=e.target.closest('[data-delete]');
  if(noticeDelete && isAdmin()){state.notices.splice(+noticeDelete.dataset.delete,1);renderEditors();}
});

onAuthStateChanged(auth, user => {
  if (user && user.uid === ADMIN_UID) {
    authUser = user;
    startPendingMessageListener();
    if (document.getElementById("admin").classList.contains("open")) renderPendingMessages();
  } else {
    authUser = null;
    stopPendingMessageListener();
  }
});

}
