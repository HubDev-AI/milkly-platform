/**
 * Email Service
 *
 * Supports Resend (production) and console.log fallback (development).
 * Provider is selected via EMAIL_PROVIDER env var (default: "resend").
 */

import { env } from "../env.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendResult {
  success: boolean;
  id?: string | undefined;
  error?: string | undefined;
}

// ---------------------------------------------------------------------------
// Provider check
// ---------------------------------------------------------------------------

function isResendConfigured(): boolean {
  return env.EMAIL_PROVIDER === "resend" && !!env.RESEND_API_KEY;
}

// ---------------------------------------------------------------------------
// Core send via Resend
// ---------------------------------------------------------------------------

async function sendViaResend(options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<SendResult> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Resend not configured. Set RESEND_API_KEY." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from ?? env.RESEND_FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    const data = (await response.json()) as { id?: string; message?: string };

    if (!response.ok) {
      return {
        success: false,
        error: data.message ?? `Failed to send email (${response.status})`,
      };
    }

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error sending email",
    };
  }
}

// ---------------------------------------------------------------------------
// Console fallback (development)
// ---------------------------------------------------------------------------

function sendViaConsole(to: string, subject: string): SendResult {
  console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
  return { success: true, id: "dev-console" };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Send a confirmation/verification email */
export async function sendConfirmationEmail(
  email: string,
  confirmUrl: string,
): Promise<SendResult> {
  const subject = "Confirm your Milkly account";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Confirm your email</h2>
      <p>Click the button below to confirm your Milkly account:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${confirmUrl}" style="display: inline-block; padding: 12px 32px; background: hsl(25 95% 53%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Confirm Email</a>
      </div>
      <p style="color: #666; font-size: 14px;">If you didn't sign up for Milkly, you can safely ignore this email.</p>
    </body>
    </html>
  `;

  if (!isResendConfigured()) {
    console.log(`[DEV EMAIL] Confirmation: ${confirmUrl}`);
    return sendViaConsole(email, subject);
  }

  return sendViaResend({ to: email, subject, html });
}

/** Send a newsletter email */
export async function sendNewsletterEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendResult> {
  if (!isResendConfigured()) {
    console.log(`[DEV EMAIL] Newsletter to ${to} | Subject: ${subject}`);
    return sendViaConsole(to, subject);
  }

  return sendViaResend({ to, subject, html });
}
