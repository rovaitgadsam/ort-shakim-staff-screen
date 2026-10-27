import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore, doc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";
const app = initializeApp(firebaseConfig, "qrSubmission"); // Separate auth session from the staff admin dashboard
const auth = getAuth(app);
const db = getFirestore(app);
const siteDoc = doc(db, "siteData", "main");
const form = document.getElementById("messageForm");
const textInput = document.getElementById("messageText");
const counter = document.getElementById("counter");
const statusBox = document.getElementById("status");
const submitButton = document.getElementById("submitButton");

textInput.addEventListener("input", () => counter.textContent = String(textInput.value.length));

function showStatus(message, kind) {
  statusBox.textContent = message;
  statusBox.className = "status " + kind;
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (document.getElementById("website").value.trim()) return;
  const text = textInput.value.trim();
  const senderName = document.getElementById("senderName").value.trim();
  if (!text) {
    showStatus("יש לכתוב הודעה לפני השליחה.", "error");
    return;
  }
  if (text.length > 280 || senderName.length > 40) {
    showStatus("ההודעה או השם ארוכים מדי.", "error");
    return;
  }
  submitButton.disabled = true;
  submitButton.textContent = "שולח...";
  statusBox.className = "status";
  try {
    if (!auth.currentUser) await signInAnonymously(auth);
    const displayText = senderName ? senderName + ": " + text : text;
    const noticeId = "qr-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
    await updateDoc(siteDoc, {
      notices: arrayUnion({ id: noticeId, text: displayText }),
      updatedAt: serverTimestamp()
    });
    form.reset();
    counter.textContent = "0";
    textInput.disabled = true;
    document.getElementById("senderName").disabled = true;
    submitButton.disabled = true;
    showStatus("ההודעה פורסמה מיד בלוח חדר המורים.", "success");
    submitButton.textContent = "ההודעה נשלחה";
  } catch (error) {
    console.error("Message submission failed", error);
    let message = "לא ניתן לשלוח כרגע. נסו שוב מאוחר יותר.";
    if (error?.code === "auth/operation-not-allowed") {
      message = "השליחה עדיין לא הופעלה בפרויקט. יש להפעיל Anonymous sign-in ב-Firebase Authentication.";
    } else if (error?.code === "permission-denied") {
      message = "Firebase דחה את ההודעה בגלל הרשאות. פרסם מחדש את firestore.rules ממאגר GitHub במסוף Firestore → Rules, וודא ש-Anonymous מופעל ב-Authentication.";
    } else if (error?.code === "auth/unauthorized-domain") {
      message = "הדומיין של האתר אינו מאושר ב-Firebase Authentication.";
    }
    showStatus(message, "error");
    submitButton.disabled = false;
    submitButton.textContent = "שליחת הודעה ללוח";
  }
});
