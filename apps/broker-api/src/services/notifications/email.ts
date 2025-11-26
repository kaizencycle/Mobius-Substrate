// apps/broker-api/src/services/notifications/email.ts
// Email notification service

import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

export interface Notification {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

/**
 * Sends a notification email
 */
export async function sendNotification(notification: Notification): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn("[Email] SMTP not configured, skipping notification");
    return;
  }

  try {
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@mobius.systems",
      to: notification.to,
      subject: `[Mobius] ${notification.subject}`,
      text: notification.body,
      html: notification.html || notification.body.replace(/\n/g, "<br>")
    });

    console.log(`[Email] Sent notification to ${notification.to}`);
  } catch (error) {
    console.error("[Email] Failed to send notification:", error);
    // Non-critical, don't throw
  }
}

