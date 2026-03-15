// Email service — implemented in Story 4-1
// Uses Resend for production, logs to console in development

export async function sendConfirmationEmail(
  _email: string,
  _confirmUrl: string
): Promise<void> {
  // TODO: implement with Resend in Story 4-1
  console.log(`[DEV EMAIL] Confirmation: ${_confirmUrl}`);
}

export async function sendNewsletterEmail(
  _to: string,
  _subject: string,
  _html: string
): Promise<void> {
  // TODO: implement with Resend in Story 4-2
  console.log(`[DEV EMAIL] Newsletter to ${_to}`);
}
