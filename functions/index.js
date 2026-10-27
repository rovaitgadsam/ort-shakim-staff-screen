const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = defineSecret("TELEGRAM_CHAT_ID");

exports.notifyOnNewQrMessage = onDocumentCreated(
  {
    document: "messageSubmissions/{submissionId}",
    region: "europe-west1",
    secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID]
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("New QR message event has no document snapshot.");
      return;
    }

    const data = snapshot.data() || {};
    const text = typeof data.text === "string" ? data.text.trim() : "";
    const sender = typeof data.senderName === "string" && data.senderName.trim()
      ? data.senderName.trim()
      : "ללא שם";

    if (!text || data.status !== "pending") {
      logger.warn("Skipping invalid or non-pending QR submission.", {
        submissionId: event.params.submissionId
      });
      return;
    }

    const token = TELEGRAM_BOT_TOKEN.value().trim();
    const chatId = TELEGRAM_CHAT_ID.value().trim();
    if (!token || !chatId) {
      throw new Error("Telegram notification secrets are not configured.");
    }

    const preview = text.length > 700 ? text.slice(0, 697) + "..." : text;
    const message = [
      "📩 הודעה חדשה ממתינה לאישור בלוח המודעות",
      "",
      "שם: " + sender,
      "הודעה: " + preview,
      "",
      "פתח את מסך הניהול כדי לאשר או לדחות:",
      "https://rovaitgadsam.github.io/ort-shakim-staff-screen/"
    ].join("\n");

    const response = await fetch(
      "https://api.telegram.org/bot" + token + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true
        })
      }
    );

    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.ok !== true) {
      logger.error("Telegram notification failed.", {
        status: response.status,
        telegramDescription: result && result.description
      });
      throw new Error("Telegram could not send the notification.");
    }

    logger.info("Telegram notification sent.", {
      submissionId: event.params.submissionId
    });
  }
);
